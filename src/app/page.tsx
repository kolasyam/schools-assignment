'use client';
import { useRouter } from 'next/navigation';
const HomePage = () => {
  const router = useRouter();
  const handleNavigation = () => {
    router.push('/SchoolForm'); // Redirect to the SchoolForm page
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-6">
        Want to add your school details?
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Click the button below to fill out the form and submit your school details.
      </p>
      <button
        onClick={handleNavigation}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
      >
        Go to School Form
      </button>
    </div>
  );
};

export default HomePage;
