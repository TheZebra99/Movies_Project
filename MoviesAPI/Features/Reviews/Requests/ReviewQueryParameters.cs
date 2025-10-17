using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Reviews.Requests;

public class ReviewQueryParameters
{
    [Range(1, int.MaxValue)]
    public int page { get; set; } = 1;

    [Range(1, 50)]
    public int pageSize { get; set; } = 10;
}