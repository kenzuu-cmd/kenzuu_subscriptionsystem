/**
 * CurrencyHelper.cs
 * Provides utility methods for currency formatting and symbol retrieval
 * 
 * CHANGE INTENT: Fix currency symbol bug - provide centralized currency management
 * This helper enables consistent currency display across the application.
 */

namespace ASIGNAR_SubscriptionSystem.Helpers
{
    /// <summary>
    /// Helper class for currency-related operations
    /// Supports multiple currencies with proper symbol formatting
    /// </summary>
    public static class CurrencyHelper
    {
        // Currency symbol mappings
        private static readonly Dictionary<string, string> CurrencySymbols = new()
        {
            { "PHP", "₱" },
            { "USD", "$" },
            { "EUR", "€" },
            { "GBP", "£" },
            { "JPY", "¥" }
        };

        /// <summary>
        /// Get the symbol for a given currency code
        /// </summary>
        /// <param name="currencyCode">ISO 4217 currency code (e.g., "PHP", "USD")</param>
        /// <returns>Currency symbol string (e.g., "₱", "$")</returns>
        public static string GetCurrencySymbol(string currencyCode)
        {
            if (string.IsNullOrWhiteSpace(currencyCode))
            {
                return "₱"; // Default to PHP
            }

            return CurrencySymbols.TryGetValue(currencyCode.ToUpper(), out var symbol) 
                ? symbol 
                : "₱"; // Fallback to PHP
        }

        /// <summary>
        /// Format an amount with the appropriate currency symbol
        /// </summary>
        /// <param name="amount">The monetary amount</param>
        /// <param name="currencyCode">ISO 4217 currency code</param>
        /// <returns>Formatted string with currency symbol</returns>
        public static string FormatAmount(decimal amount, string currencyCode = "PHP")
        {
            var symbol = GetCurrencySymbol(currencyCode);
            return $"{symbol}{amount:N2}";
        }

        /// <summary>
        /// Get the full currency name for a given code
        /// </summary>
        /// <param name="currencyCode">ISO 4217 currency code</param>
        /// <returns>Full currency name</returns>
        public static string GetCurrencyName(string currencyCode)
        {
            return currencyCode?.ToUpper() switch
            {
                "PHP" => "Philippine Peso",
                "USD" => "United States Dollar",
                "EUR" => "Euro",
                "GBP" => "British Pound",
                "JPY" => "Japanese Yen",
                _ => "Philippine Peso" // Default
            };
        }

        /// <summary>
        /// Get all supported currencies
        /// </summary>
        /// <returns>Dictionary of currency codes and their symbols</returns>
        public static IReadOnlyDictionary<string, string> GetSupportedCurrencies()
        {
            return CurrencySymbols;
        }
    }
}
