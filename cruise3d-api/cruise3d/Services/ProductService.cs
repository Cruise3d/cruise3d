using cruise3d.API.Models.DTOs.Product;
using cruise3d.Models.Entities;
using cruise3d.API.Repositories.Interfaces;
using cruise3d.API.Services.Interfaces;

namespace cruise3d.API.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _products;
    private readonly IProductImageRepository _images;

    public ProductService(IProductRepository products, IProductImageRepository images)
    {
        _products = products;
        _images = images;
    }

    // ─── GET ALL (with filters, search, pagination) ───────────────────────────
    public async Task<(IEnumerable<ProductListItemDto> Items, int Total)> GetAllAsync(
        Guid? categoryId, string? search, decimal? minPrice, decimal? maxPrice,
        string? sortBy, int page, int pageSize)
    {
        var (items, total) = await _products.GetAllAsync(
            categoryId, search, minPrice, maxPrice, sortBy, page, pageSize);

        var dtos = items.Select(MapToListItem);
        return (dtos, total);
    }

    // ─── GET BY ID ────────────────────────────────────────────────────────────
    public async Task<ProductResponseDto> GetByIdAsync(Guid id)
    {
        var product = await _products.GetByIdWithDetailsAsync(id)
            ?? throw new Exception("Product not found.");

        return MapToResponse(product);
    }

    // ─── GET FEATURED ─────────────────────────────────────────────────────────
    public async Task<IEnumerable<ProductListItemDto>> GetFeaturedAsync()
    {
        var products = await _products.GetFeaturedAsync();
        return products.Select(MapToListItem);
    }

    // ─── GET BESTSELLERS ──────────────────────────────────────────────────────
    public async Task<IEnumerable<ProductListItemDto>> GetBestsellersAsync()
    {
        var products = await _products.GetBestsellersAsync();
        return products.Select(MapToListItem);
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────
    public async Task<ProductResponseDto> CreateAsync(ProductCreateDto dto)
    {
        // 1. Validate SKU is unique
        if (await _products.SkuExistsAsync(dto.Sku))
            throw new Exception($"SKU '{dto.Sku}' already exists.");

        // 2. Validate color rules
        if (dto.ColorType == "custom" && dto.Colors.Count == 0)
            throw new Exception("Custom color products must have at least one color.");

        if (dto.ColorType == "fixed" && string.IsNullOrWhiteSpace(dto.DefaultColorName))
            throw new Exception("Fixed color products must have a default color name.");

        // 3. Build product entity
        var product = new Product
        {
            Id                = Guid.NewGuid(),
            CategoryId        = dto.CategoryId,
            Title             = dto.Title,
            Description       = dto.Description,
            Sku               = dto.Sku.ToUpper().Trim(),
            Price             = dto.Price,
            Stock             = dto.Stock,
            Material          = dto.Material,
            WeightGrams       = dto.WeightGrams,
            Dimensions        = dto.Dimensions,
            EstimatedDelivery = dto.EstimatedDelivery,
            ColorType         = dto.ColorType,
            DefaultColorName  = dto.DefaultColorName,
            DefaultColorHex   = dto.DefaultColorHex,
            IsFeatured        = dto.IsFeatured,
            IsBestseller      = dto.IsBestseller,
            IsActive          = true,
            CreatedAt         = DateTime.UtcNow,
            UpdatedAt         = DateTime.UtcNow
        };

        // 4. Add colors if custom
        if (dto.ColorType == "custom")
        {
            product.Colors = dto.Colors.Select((c, index) => new ProductColor
            {
                Id        = Guid.NewGuid(),
                ColorName = c.ColorName,
                ColorHex  = c.ColorHex,
                StockOverride = c.StockOverride,
                SortOrder = index
            }).ToList();
        }

        // 5. Add specs
        if (dto.Specs.Count > 0)
        {
            product.Specs = dto.Specs.Select((s, index) => new ProductSpec
            {
                Id         = Guid.NewGuid(),
                SpecKey    = s.SpecKey,
                SpecValue  = s.SpecValue,
                SortOrder  = index
            }).ToList();
        }

        // 5.5 Add images if provided
        if (dto.Images.Count > 0)
        {
            var hasPrimary = dto.Images.Any(i => i.IsPrimary);

            product.Images = dto.Images.Select((img, index) => new ProductImage
            {
                Id             = Guid.NewGuid(),
                ProductId      = product.Id,
                Url            = img.Url,
                IsPrimary      = hasPrimary ? img.IsPrimary : index == 0,
                SortOrder      = img.SortOrder > 0 ? img.SortOrder : index,
                ProductColorId = img.ProductColorId
            }).ToList();
        }

        var created = await _products.CreateAsync(product);
        return MapToResponse(created);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    public async Task<ProductResponseDto> UpdateAsync(Guid id, ProductUpdateDto dto)
    {
        var product = await _products.GetByIdAsync(id)
            ?? throw new Exception("Product not found.");

        // Check SKU uniqueness if changed
        if (dto.Sku != null && dto.Sku != product.Sku)
            if (await _products.SkuExistsAsync(dto.Sku, id))
                throw new Exception($"SKU '{dto.Sku}' already exists.");

        // Update only fields that were provided
        if (dto.Title        != null) product.Title             = dto.Title;
        if (dto.Description  != null) product.Description       = dto.Description;
        if (dto.Sku          != null) product.Sku               = dto.Sku.ToUpper().Trim();
        if (dto.Price        != null) product.Price             = dto.Price.Value;
        if (dto.Stock        != null) product.Stock             = dto.Stock.Value;
        if (dto.CategoryId   != null) product.CategoryId        = dto.CategoryId;
        if (dto.Material     != null) product.Material          = dto.Material;
        if (dto.WeightGrams  != null) product.WeightGrams       = dto.WeightGrams;
        if (dto.Dimensions   != null) product.Dimensions        = dto.Dimensions;
        if (dto.EstimatedDelivery != null) product.EstimatedDelivery = dto.EstimatedDelivery;
        if (dto.ColorType    != null) product.ColorType         = dto.ColorType;
        if (dto.DefaultColorName != null) product.DefaultColorName = dto.DefaultColorName;
        if (dto.DefaultColorHex  != null) product.DefaultColorHex  = dto.DefaultColorHex;
        if (dto.IsFeatured   != null) product.IsFeatured        = dto.IsFeatured.Value;
        if (dto.IsBestseller != null) product.IsBestseller      = dto.IsBestseller.Value;
        if (dto.IsActive     != null) product.IsActive          = dto.IsActive.Value;

        if (dto.Images != null)
        {
            var hasPrimary = dto.Images.Any(i => i.IsPrimary);

            await _images.DeleteByProductIdAsync(product.Id);

            foreach (var (img, index) in dto.Images.Select((img, index) => (img, index)))
            {
                await _images.CreateAsync(new ProductImage
                {
                    Id             = Guid.NewGuid(),
                    ProductId      = product.Id,
                    Url            = img.Url,
                    IsPrimary      = hasPrimary ? img.IsPrimary : index == 0,
                    SortOrder      = img.SortOrder > 0 ? img.SortOrder : index,
                    ProductColorId = img.ProductColorId
                });
            }
        }

        product.UpdatedAt = DateTime.UtcNow;

        await _products.UpdateAsync(product);
        return MapToResponse(product);
    }

    // ─── DELETE (soft delete) ─────────────────────────────────────────────────
    public async Task DeleteAsync(Guid id)
    {
        var product = await _products.GetByIdAsync(id)
            ?? throw new Exception("Product not found.");

        // Soft delete — just marks IsActive = false
        // Product stays in DB so old orders still reference it
        await _products.DeleteAsync(id);
    }

    // ─── SKU EXISTS ───────────────────────────────────────────────────────────
    public async Task<bool> SkuExistsAsync(string sku, Guid? excludeId = null)
        => await _products.SkuExistsAsync(sku, excludeId);

    // ─── MAPPING HELPERS ──────────────────────────────────────────────────────

    // Full detail response — used for product detail page
    private static ProductResponseDto MapToResponse(Product p) => new()
    {
        Id               = p.Id,
        Title            = p.Title,
        Description      = p.Description,
        Sku              = p.Sku,
        Price            = p.Price,
        Stock            = p.Stock,
        Material         = p.Material,
        WeightGrams      = p.WeightGrams,
        Dimensions       = p.Dimensions,
        EstimatedDelivery = p.EstimatedDelivery,
        ColorType        = p.ColorType,
        DefaultColorName = p.DefaultColorName,
        DefaultColorHex  = p.DefaultColorHex,
        IsFeatured       = p.IsFeatured,
        IsBestseller     = p.IsBestseller,
        IsActive         = p.IsActive,
        CreatedAt        = p.CreatedAt,
        CategoryId       = p.CategoryId,
        CategoryName     = p.Category?.Name,
        AverageRating    = p.Reviews.Any()
                            ? Math.Round(p.Reviews.Average(r => r.Rating), 1)
                            : 0,
        ReviewCount      = p.Reviews.Count,
        Colors = p.Colors.OrderBy(c => c.SortOrder).Select(c => new ProductColorResponseDto
        {
            Id            = c.Id,
            ColorName     = c.ColorName,
            ColorHex      = c.ColorHex,
            StockOverride = c.StockOverride,
            SortOrder     = c.SortOrder
        }).ToList(),
        Images = p.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageResponseDto
        {
            Id             = i.Id,
            Url            = i.Url,
            IsPrimary      = i.IsPrimary,
            SortOrder      = i.SortOrder,
            ProductColorId = i.ProductColorId
        }).ToList(),
        Specs = p.Specs.OrderBy(s => s.SortOrder).Select(s => new ProductSpecResponseDto
        {
            Id        = s.Id,
            SpecKey   = s.SpecKey,
            SpecValue = s.SpecValue,
            SortOrder = s.SortOrder
        }).ToList()
    };

    // Light version — used for product listing/browse page cards
    private static ProductListItemDto MapToListItem(Product p) => new()
    {
        Id             = p.Id,
        Title          = p.Title,
        Price          = p.Price,
        Stock          = p.Stock,
        CategoryName   = p.Category?.Name,
        ColorType      = p.ColorType,
        PrimaryImageUrl = p.Images
                            .Where(i => i.IsPrimary)
                            .OrderBy(i => i.SortOrder)
                            .FirstOrDefault()?.Url,
        AverageRating  = p.Reviews.Any()
                            ? Math.Round(p.Reviews.Average(r => r.Rating), 1)
                            : 0,
        ReviewCount    = p.Reviews.Count
    };
}

