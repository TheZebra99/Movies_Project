using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Watchlist.Requests;

public class AddToWatchlistRequest
{
    [Required]
    public int movie_id { get; set; }
}