namespace DigiSay.Application.Common.Pagination;

public sealed record PageSlice<T>(IReadOnlyList<T> Items, int TotalCount);
