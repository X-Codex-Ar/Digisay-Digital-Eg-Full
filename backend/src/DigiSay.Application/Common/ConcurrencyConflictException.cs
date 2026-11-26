namespace DigiSay.Application.Common;

/// <summary>
/// Raised when a record was changed by another request after it was loaded, so the save was rejected.
/// </summary>
public sealed class ConcurrencyConflictException(string message, Exception? innerException = null)
    : Exception(message, innerException);
