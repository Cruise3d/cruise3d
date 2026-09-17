const DEFAULT_PRODUCT_IMAGE_BASE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop';

export const getDefaultProductImage = (width = 800): string =>
  `${DEFAULT_PRODUCT_IMAGE_BASE}&w=${width}&q=80`;
