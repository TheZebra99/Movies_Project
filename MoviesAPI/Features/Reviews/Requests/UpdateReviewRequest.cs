using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Reviews.Requests;

public class UpdateReviewRequest
{
    [Range(1, 10, ErrorMessage = "Rating must be between 1 and 10")]
    public int? rating { get; set; }

    [MaxLength(2000, ErrorMessage = "Review text cannot exceed 2000 characters")]
    public string? review_text { get; set; }
}