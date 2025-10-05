import { useState } from "react";
import { useNavigate } from "react-router-dom";
import spaceStationImage from '../assets/SpaceStation.jpg';
import seedlingImage from '../assets/SeedlingGrowth.jpg';
import molecularImage from '../assets/Molecular Structure.jpg';
import earthImage from '../assets/Earth from Space.jpg';

export default function TaskBookModern() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');

  // Different book datasets for each section
  const taskbookBooks = [
    { id: 1, title: "Microgravity Effects on Plant Growth", investigator: "Dr. Sarah Johnson", center: "NASA ARC", year: "2024", program: "Space Biology", type: "Flight", section: "taskbook", image: "https://books.google.com/books/content?id=fZZYDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { id: 2, title: "Bone Density Loss in Long-Duration Spaceflight", investigator: "Dr. Michael Chen", center: "NASA JSC", year: "2023", program: "Human Research", type: "Flight", section: "taskbook", image: "https://books.google.com/books/content?id=8Q7tDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { id: 3, title: "Cardiovascular Adaptation to Spaceflight", investigator: "Dr. Lisa Martinez", center: "NASA JSC", year: "2024", program: "Human Research", type: "Flight", section: "taskbook", image: "https://books.google.com/books/content?id=vZN0DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
  ];

  const archivesBooks = [
    { id: 11, title: "Historical Space Biology Studies 1990-2000", investigator: "Dr. Robert Smith", center: "NASA ARC", year: "2000", program: "Space Biology", type: "Ground", section: "archives", image: "https://books.google.com/books/content?id=TYzMEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { id: 12, title: "Early Microgravity Research Archive", investigator: "Dr. Patricia Davis", center: "NASA MSFC", year: "1995", program: "Physical Sciences", type: "Flight", section: "archives", image: "https://books.google.com/books/content?id=KqRzDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { id: 13, title: "Archived Human Spaceflight Studies", investigator: "Dr. Thomas Anderson", center: "NASA JSC", year: "1998", program: "Human Research", type: "Flight", section: "archives", image: "https://books.google.com/books/content?id=pZN0DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
  ];

  const bibliographyBooks = [
    { id: 21, title: "Space Biology Research Publications Compendium", investigator: "Dr. Jennifer White", center: "NASA ARC", year: "2024", program: "Space Biology", type: "NASA GeneLab", section: "bibliography", image: "https://books.google.com/books/content?id=2XMLEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { id: 22, title: "Comprehensive Bibliography of Microgravity Studies", investigator: "Dr. Mark Thompson", center: "NASA MSFC", year: "2023", program: "Physical Sciences", type: "Ground", section: "bibliography", image: "https://books.google.com/books/content?id=9HZHEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { id: 23, title: "Human Spaceflight Research Bibliography", investigator: "Dr. Susan Garcia", center: "NASA JSC", year: "2024", program: "Human Research", type: "Flight", section: "bibliography", image: "https://books.google.com/books/content?id=fZZYDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
  ];

  const highlightsBooks = [
    { id: 31, title: "Breakthrough Discoveries in Space Biology 2024", investigator: "Dr. Richard Moore", center: "NASA ARC", year: "2024", program: "Space Biology", type: "New Investigation", section: "highlights", image: "https://books.google.com/books/content?id=8Q7tDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { id: 32, title: "Revolutionary Physical Sciences Research", investigator: "Dr. Karen Taylor", center: "NASA MSFC", year: "2024", program: "Physical Sciences", type: "Ground", section: "highlights", image: "https://books.google.com/books/content?id=vZN0DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
    { id: 33, title: "Major Advances in Human Spaceflight Research", investigator: "Dr. Daniel Martinez", center: "NASA JSC", year: "2024", program: "Human Research", type: "Flight", section: "highlights", image: "https://books.google.com/books/content?id=KqRzDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" },
  ];

  const getAllBooks = () => {
    if (selectedSection === 'taskbook') return taskbookBooks;
    if (selectedSection === 'archives') return archivesBooks;
    if (selectedSection === 'bibliography') return bibliographyBooks;
    if (selectedSection === 'highlights') return highlightsBooks;
    return [];
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const currentBooks = getAllBooks();
    
    // Filter books based on form data
    let filtered = currentBooks.filter((book) => {
      // Program filter
      if (formData["Human Research"] || formData["Space Biology"] || formData["Physical Sciences"]) {
        if (formData["Human Research"] && book.program === "Human Research") return true;
        if (formData["Space Biology"] && book.program === "Space Biology") return true;
        if (formData["Physical Sciences"] && book.program === "Physical Sciences") return true;
        return false;
      }
      
      // Investigator filter
      if (formData.investigatorLast && !book.investigator.toLowerCase().includes(formData.investigatorLast.toLowerCase())) return false;
      if (formData.investigatorFirst && !book.investigator.toLowerCase().includes(formData.investigatorFirst.toLowerCase())) return false;
      
      // Keyword filter
      if (formData.keyword && !book.title.toLowerCase().includes(formData.keyword.toLowerCase())) return false;
      
      // Project Type filter
      if (formData["Flight"] || formData["Ground"] || formData["NASA GeneLab"] || formData["New Investigation"]) {
        if (formData["Flight"] && book.type === "Flight") return true;
        if (formData["Ground"] && book.type === "Ground") return true;
        if (formData["NASA GeneLab"] && book.type === "NASA GeneLab") return true;
        if (formData["New Investigation"] && book.type === "New Investigation") return true;
        return false;
      }
      
      // Responsible Center filter
      if (formData["NASA ARC"] || formData["NASA JSC"] || formData["NASA KSC"] || formData["NASA MSFC"]) {
        if (formData["NASA ARC"] && book.center === "NASA ARC") return true;
        if (formData["NASA JSC"] && book.center === "NASA JSC") return true;
        if (formData["NASA KSC"] && book.center === "NASA KSC") return true;
        if (formData["NASA MSFC"] && book.center === "NASA MSFC") return true;
        return false;
      }
      
      return true;
    });
    
    // Navigate to results page with filtered data
    navigate("/taskbook/results", { state: { results: filtered } });
  };

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-4 bg-black shadow-md sticky top-0 z-50 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-wide">NASA Task Book</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            ← Back to Home
          </button>
        </nav>

        {/* Header */}
        <div className="max-w-6xl mx-auto mt-12 text-center">
          <h2 className="text-4xl font-extrabold mb-4">NASA Task Book</h2>
          <p className="text-gray-400 mb-10">
            Explore research projects, archives, bibliography, and highlights from NASA's space programs.
          </p>
        </div>

        {/* Four Buttons */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <button
            onClick={() => { setShowForm(true); setSelectedSection('taskbook'); }}
            className="relative h-[500px] rounded-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            <img src={spaceStationImage} alt="Search Task Book" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
              <h3 className="text-3xl font-bold mb-3">Search Task Book</h3>
              <p className="text-gray-200 text-lg">Search current research projects and investigations</p>
            </div>
          </button>

          <button
            onClick={() => { setShowForm(true); setSelectedSection('archives'); }}
            className="relative h-[500px] rounded-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            <img src={seedlingImage} alt="Search Archives" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
              <h3 className="text-3xl font-bold mb-3">Search Task Book Archives</h3>
              <p className="text-gray-200 text-lg">Browse historical research data and completed projects</p>
            </div>
          </button>

          <button
            onClick={() => { setShowForm(true); setSelectedSection('bibliography'); }}
            className="relative h-[500px] rounded-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            <img src={molecularImage} alt="Search Bibliography" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
              <h3 className="text-3xl font-bold mb-3">Search Bibliography</h3>
              <p className="text-gray-200 text-lg">Access publications and research papers</p>
            </div>
          </button>

          <button
            onClick={() => { setShowForm(true); setSelectedSection('highlights'); }}
            className="relative h-[500px] rounded-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            <img src={earthImage} alt="Research Highlights" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
              <h3 className="text-3xl font-bold mb-3">Space Life & Physical Sciences Research Highlights</h3>
              <p className="text-gray-200 text-lg">Discover featured research and breakthroughs</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-gray-400 mt-10">
          Source:{" "}
          <a
            href="https://taskbook.nasaprs.com"
            target="_blank"
            rel="noreferrer"
            className="underline text-white hover:text-blue-400"
          >
            NASA Task Book
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-black shadow-md sticky top-0 z-50 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wide">NASA Task Book</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(false)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Home
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-6xl mx-auto mt-12 text-center">
        <h2 className="text-4xl font-extrabold mb-4">
          {selectedSection === 'taskbook' && 'Task Book Basic Search'}
          {selectedSection === 'archives' && 'Task Book Archives Search'}
          {selectedSection === 'bibliography' && 'Bibliography Search'}
          {selectedSection === 'highlights' && 'Research Highlights Search'}
        </h2>
        <p className="text-gray-400 mb-10">
          {selectedSection === 'taskbook' && 'Search current research projects from Human Research, Space Biology, and Physical Sciences.'}
          {selectedSection === 'archives' && 'Browse historical research data and completed projects.'}
          {selectedSection === 'bibliography' && 'Search publications and research papers.'}
          {selectedSection === 'highlights' && 'Discover featured research and breakthroughs.'}
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto bg-white text-black rounded-2xl shadow-xl p-8 grid grid-cols-3 gap-6"
      >
        {selectedSection === 'taskbook' && (
          <>
        {/* Program */}
        <div className="col-span-3">
          <label className="font-semibold text-gray-700 block mb-2">Program</label>
          <div className="flex gap-6 flex-wrap">
            {["Human Research", "Space Biology", "Physical Sciences"].map((label) => (
              <label key={label} className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  name={label}
                  onChange={handleChange}
                  className="accent-blue-600 w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Fiscal Year */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">Fiscal Year</label>
          <select
            name="fiscalYear"
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option>All Reports FY04 - present</option>
          </select>
        </div>

        {/* Added/Updated */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">Added/Updated</label>
          <select
            name="updated"
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
          </select>
        </div>

        {/* Investigator Names */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">Investigator Lastname</label>
          <input
            name="investigatorLast"
            onChange={handleChange}
            type="text"
            placeholder="Enter Lastname"
            className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 block mb-2">Investigator Firstname</label>
          <input
            name="investigatorFirst"
            onChange={handleChange}
            type="text"
            placeholder="Enter Firstname"
            className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Co-Investigator */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">Co-Investigator Lastname</label>
          <input
            name="coinvestigatorLast"
            onChange={handleChange}
            type="text"
            placeholder="Enter Lastname"
            className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 block mb-2">Co-Investigator Firstname</label>
          <input
            name="coinvestigatorFirst"
            onChange={handleChange}
            type="text"
            placeholder="Enter Firstname"
            className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Keyword */}
        <div className="col-span-3">
          <label className="font-semibold text-gray-700 block mb-2">Keyword</label>
          <input
            name="keyword"
            onChange={handleChange}
            type="text"
            placeholder="Enter keyword"
            className="w-full border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Project Type */}
        <div className="col-span-3">
          <label className="font-semibold text-gray-700 block mb-2">Project Type</label>
          <div className="flex gap-6 flex-wrap">
            {["Flight", "Ground", "NASA GeneLab", "New Investigation"].map((label) => (
              <label key={label} className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  name={label}
                  onChange={handleChange}
                  className="accent-blue-600 w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Responsible Center */}
        <div className="col-span-3">
          <label className="font-semibold text-gray-700 block mb-2">Responsible Center</label>
          <div className="flex gap-6 flex-wrap">
            {["NASA ARC", "NASA JSC", "NASA KSC", "NASA MSFC"].map((label) => (
              <label key={label} className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  name={label}
                  onChange={handleChange}
                  className="accent-blue-600 w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

          </>
        )}

        {selectedSection === 'archives' && (
          <>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Archive Year Range</label>
              <div className="grid grid-cols-2 gap-4">
                <input name="yearFrom" onChange={handleChange} type="text" placeholder="From Year" className="w-full border-gray-300 rounded-lg p-2" />
                <input name="yearTo" onChange={handleChange} type="text" placeholder="To Year" className="w-full border-gray-300 rounded-lg p-2" />
              </div>
            </div>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Investigator Name</label>
              <input name="investigator" onChange={handleChange} type="text" placeholder="Enter name" className="w-full border-gray-300 rounded-lg p-2" />
            </div>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Keyword</label>
              <input name="keyword" onChange={handleChange} type="text" placeholder="Enter keyword" className="w-full border-gray-300 rounded-lg p-2" />
            </div>
          </>
        )}

        {selectedSection === 'bibliography' && (
          <>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Publication Title</label>
              <input name="pubTitle" onChange={handleChange} type="text" placeholder="Enter title" className="w-full border-gray-300 rounded-lg p-2" />
            </div>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Author Name</label>
              <input name="author" onChange={handleChange} type="text" placeholder="Enter author" className="w-full border-gray-300 rounded-lg p-2" />
            </div>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Publication Year</label>
              <input name="pubYear" onChange={handleChange} type="text" placeholder="Enter year" className="w-full border-gray-300 rounded-lg p-2" />
            </div>
          </>
        )}

        {selectedSection === 'highlights' && (
          <>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Research Area</label>
              <select name="researchArea" onChange={handleChange} className="w-full border-gray-300 rounded-lg p-2">
                <option>All Areas</option>
                <option>Space Biology</option>
                <option>Human Research</option>
                <option>Physical Sciences</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Highlight Year</label>
              <input name="highlightYear" onChange={handleChange} type="text" placeholder="Enter year" className="w-full border-gray-300 rounded-lg p-2" />
            </div>
            <div className="col-span-3">
              <label className="font-semibold text-gray-700 block mb-2">Search Term</label>
              <input name="searchTerm" onChange={handleChange} type="text" placeholder="Enter search term" className="w-full border-gray-300 rounded-lg p-2" />
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="col-span-3 flex justify-center gap-6 mt-4">
          <button
            type="submit"
            className="bg-black text-white px-12 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Search
          </button>
          <button
            type="reset"
            onClick={() => setFormData({})}
            className="border-2 border-black text-black px-12 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 mt-10">
        Source:{" "}
        <a
          href="https://taskbook.nasaprs.com"
          target="_blank"
          rel="noreferrer"
          className="underline text-white hover:text-blue-400"
        >
          NASA Task Book
        </a>
      </footer>
    </div>
  );
}
