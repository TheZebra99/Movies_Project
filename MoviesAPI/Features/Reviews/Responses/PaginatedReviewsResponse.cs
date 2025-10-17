namespace MoviesAPI.Features.Reviews.Responses;

public class PaginatedReviewsResponse
{
    public IEnumerable<ReviewResponse> reviews { get; set; } = new List<ReviewResponse>();
    public int page { get; set; }
    public int pageSize { get; set; }
    public int totalCount { get; set; }
    public int totalPages { get; set; }
    public bool hasPreviousPage { get; set; }
    public bool hasNextPage { get; set; }
}