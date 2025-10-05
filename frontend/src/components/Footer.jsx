import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white px-8 py-12">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between gap-12">
        {/* Left Column - Logo + About */}
        <div className="max-w-sm">
          <h2 className="text-lg font-bold">
            NASA Space Biology Research Platform
          </h2>
          <p className="text-sm mt-3 leading-6 text-gray-300">
            Access 608 full-text space biology publications and explore NASA's research on biological systems in space environments.
          </p>
          <a
            href="#"
            className="text-blue-400 font-semibold inline-block mt-3 hover:underline"
          >
            Explore Research →
          </a>
        </div>

        {/* Middle Section - Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm">
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Publications</a></li>
            <li><a href="#" className="hover:underline">Research Data</a></li>
            <li><a href="#" className="hover:underline">AI Tools</a></li>
            <li><a href="#" className="hover:underline">Search</a></li>
          </ul>

          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Space Biology</a></li>
            <li><a href="#" className="hover:underline">Microgravity Research</a></li>
            <li><a href="#" className="hover:underline">Life Sciences</a></li>
            <li><a href="#" className="hover:underline">Experiments</a></li>
            <li><a href="#" className="hover:underline">Data Repository</a></li>
          </ul>

          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">About</a></li>
            <li><a href="#" className="hover:underline">Help</a></li>
            <li><a href="#" className="hover:underline">API Access</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
            <li><a href="#" className="hover:underline">Feedback</a></li>
          </ul>
        </div>

        {/* Right Section - Resources */}
        <div>
          <p className="font-semibold mb-3">Resources</p>
          <div className="space-y-2 text-sm">
            <a href="#" className="block hover:underline">NASA OSDR</a>
            <a href="#" className="block hover:underline">Space Life Sciences Library</a>
            <a href="#" className="block hover:underline">NASA Task Book</a>
            <a href="#" className="block hover:underline">Open Science Data</a>
            <a href="#" className="block hover:underline">Research Guidelines</a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-xs text-gray-400 flex flex-col lg:flex-row justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <a href="#" className="hover:underline">Sitemap</a>
          <a href="#" className="hover:underline">For Media</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">FOIA</a>
          <a href="#" className="hover:underline">No FEAR Act</a>
          <a href="#" className="hover:underline">Office of the IG</a>
          <a href="#" className="hover:underline">Budget & Annual Reports</a>
          <a href="#" className="hover:underline">Agency Financial Reports</a>
          <a href="#" className="hover:underline">Contact NASA</a>
          <a href="#" className="hover:underline">Accessibility</a>
        </div>
        <div>
          NASA Space Biology Research Platform © 2024 | Last Updated: <strong>Dec 2024</strong> | 
          Data from NASA Open Science Data Repository
        </div>
      </div>
    </footer>
  );
};

export default Footer;