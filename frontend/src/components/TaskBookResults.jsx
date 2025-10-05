import { useNavigate, useLocation } from "react-router-dom";

export default function TaskBookResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchResults = location.state?.results || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-black shadow-md sticky top-0 z-50 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wide">NASA Task Book - Results</h1>
        </div>
        <button
          onClick={() => navigate("/taskbook")}
          className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          ← Back to Search
        </button>
      </nav>

      {/* Results */}
      <div className="max-w-7xl mx-auto mt-12 mb-12 px-6">
        <h3 className="text-3xl font-bold mb-8 text-center">
          {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} Found
        </h3>
        
        {searchResults.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl">No results found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map((book) => (
              <div
                key={book.id}
                className="bg-white text-black rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Book Cover Image */}
                <div className="h-64 overflow-hidden">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Book Details */}
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 line-clamp-2">{book.title}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500 font-semibold">Investigator</p>
                      <p className="text-gray-800">{book.investigator}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-500 font-semibold">Program</p>
                        <p className="text-gray-800 text-xs">{book.program}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold">Year</p>
                        <p className="text-gray-800">{book.year}</p>
                      </div>
                    </div>
                    
                    <button className="mt-3 w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
