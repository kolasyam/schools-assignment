"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation"; // Next.js router for navigation
import Image from "next/image";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type School = {
  id: number;
  schoolName: string;
  address: string;
  city: string;
  email: string;
  image_url: string;
};

const SchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data: schools, error } = await supabase
          .from("schools")
          .select("*")
          .order('id', { ascending: false });
        if (error) throw error;
        setSchools(schools || []);
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center sm:justify-start mb-8">
        <button
          onClick={() => router.push("/SchoolForm")}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-lg"
        >
          Add School
        </button>
      </div>
      <h1 className="text-3xl font-bold text-center mb-8 hidden sm:block">
        Schools List
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <div
            key={school.id}
            className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 group transition-transform duration-300 hover:shadow-xl hover:scale-105"
          >
            {school.image_url && (
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={school.image_url}
                  alt={school.schoolName}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-lg font-bold mb-2">{school.schoolName}</h2>
              <p className="text-sm text-gray-500 mb-1">{school.address}</p>
              <p className="text-sm text-gray-500 mb-1">{school.city}</p>
              <p className="text-sm text-gray-500 mb-4">{school.email}</p>
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolsPage;
