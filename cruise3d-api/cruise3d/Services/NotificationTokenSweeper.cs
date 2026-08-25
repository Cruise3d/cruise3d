using cruise3d.API.Repositories.Interfaces;

namespace cruise3d.API.Services;

/// <summary>
/// Periodically removes FCM tokens that haven't been seen for a long time.
/// Browsers can revoke tokens without notifying us, so we sweep stale rows.
/// </summary>
public class NotificationTokenSweeper : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<NotificationTokenSweeper> _logger;

    public NotificationTokenSweeper(
        IServiceProvider sp,
        ILogger<NotificationTokenSweeper> logger)
    {
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Run once a day
        var interval = TimeSpan.FromDays(1);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _sp.CreateScope();
                var repo = scope.ServiceProvider
                    .GetRequiredService<INotificationTokenRepository>();

                var cutoff = DateTime.UtcNow.AddDays(-90);
                var stale = await repo.GetStaleTokensAsync(cutoff);

                if (stale.Count > 0)
                {
                    await repo.RemoveInvalidAsync(stale);
                    _logger.LogInformation(
                        "Removed {Count} stale FCM tokens (older than {Cutoff:o})",
                        stale.Count, cutoff);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NotificationTokenSweeper failed");
            }

            try
            {
                await Task.Delay(interval, stoppingToken);
            }
            catch (TaskCanceledException) { /* shutting down */ }
        }
    }
}
