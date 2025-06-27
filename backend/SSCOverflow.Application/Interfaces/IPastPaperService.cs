using SSCOverflow.Application.DTOs;

namespace SSCOverflow.Application.Interfaces
{
    public interface IPastPaperService
    {
        Task<IEnumerable<PastPaperDto>> GetAllPastPapersAsync(int page = 1, int pageSize = 10);
        Task<PastPaperDto?> GetPastPaperByIdAsync(int id);
        Task<PastPaperDto> CreatePastPaperAsync(PastPaperDto pastPaperDto);
        Task<PastPaperDto> UpdatePastPaperAsync(int id, PastPaperDto pastPaperDto);
        Task<bool> DeletePastPaperAsync(int id);
        Task<IEnumerable<PastPaperDto>> SearchPastPapersAsync(string query, int page = 1, int pageSize = 10);
        Task<IEnumerable<PastPaperDto>> GetPastPapersBySubjectAsync(string subject, int page = 1, int pageSize = 10);
        Task<IEnumerable<PastPaperDto>> GetPastPapersByYearAsync(string year, int page = 1, int pageSize = 10);
        Task IncrementDownloadCountAsync(int pastPaperId);
    }
} 