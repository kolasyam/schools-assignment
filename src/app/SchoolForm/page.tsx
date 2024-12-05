"use client";
import React, { useState, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CloudinaryContext, Image as CloudinaryImage } from "cloudinary-react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

//supabase environment keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


const schema = yup.object().shape({
  schoolName: yup.string().required("School name is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  email: yup
    .string()
    .required("Email is required")
    .matches(/@/, 'Email must contain "@"')
    .email("Invalid email format"),
  schoolImage: yup
    .mixed<FileList>()
    .required("School image is required")
    .test("fileType", "Unsupported file type", (value) => {
      if (value && value[0]) {
        return value[0].type.startsWith("image/");
      }
      return false;
    }),
});

type FormValues = {
  schoolName: string;
  address: string;
  city: string;
  email: string;
  schoolImage: FileList;
};

const SchoolForm: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  // Submit Handler
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    const formData = {
      schoolName: data.schoolName,
      address: data.address,
      city: data.city,
      email: data.email,
      image_url: imageUrl, // The uploaded image URL from Cloudinary
    };

    try {
      // Insert data into the Supabase 'schools' table
      const { error } = await supabase.from("schools").insert([
        {
          schoolName: formData.schoolName,
          address: formData.address,
          city: formData.city,
          email: formData.email,
          image_url: formData.image_url,
        },
      ]);

      if (error) {
        console.error("Error inserting data into Supabase:", error);
        // alert("Failed to save school details. Please try again.");
        toast.error("Failed to save school details. Please try again.");
        setIsSubmitting(false);
        return;
      }

    //   alert("Form submitted successfully!");
    toast.success("Form submitted successfully!");

      // Reset the form after successful submission
      reset({
        schoolName: "",
        address: "",
        city: "",
        email: "",
        schoolImage: undefined, // Reset the file input
      });

      // Clear image preview and reset the input file field
      if (imageInputRef.current) {
        imageInputRef.current.value = ""; // Reset file input value
      }
      setImagePreview(null); // Clear image preview
      setImageUrl(null); // Clear image URL
      router.push("/ShowSchools");
    } catch (error) {
      console.error("Error during form submission:", error);
    //   alert("An unexpected error occurred. Please try again.");
    toast.error("An unexpected error occurred. Please try again.");
    setIsSubmitting(false);
    }
  };

  // Handle image upload to Cloudinary
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      // Create a DataTransfer object to simulate a FileList
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file); // Add the selected file to DataTransfer

      // Create a FileList from the DataTransfer object
      const fileList = dataTransfer.files;
      
      // Upload to Cloudinary
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "school-image"); // Cloudinary Upload preset
      formData.append("cloud_name", "diua6dr4f"); // Cloudinary cloud name

      // Cloudinary API URL
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/diua6dr4f/image/upload`;

      // Upload the image to Cloudinary
      fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.secure_url) {
            setImageUrl(data.secure_url); // Set the image URL
            setImagePreview(data.secure_url); // Preview the uploaded image
            setValue("schoolImage", fileList); // Update the form value with FileList
        }
        setIsUploading(false);
        })
        .catch((error) => {
          console.error("Error uploading image to Cloudinary", error);
          toast.error("Error uploading image to Cloudinary.");
          setIsUploading(false);
        });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 py-2 px-5 gap-4">
      <button
      onClick={()=> router.push("/")}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
      >
        Go to home
      </button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          School Form
        </h2>

        {/* School Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Name
          </label>
          <input
            type="text"
            {...register("schoolName")}
            className={`w-full px-4 py-3 border ${
              errors.schoolName ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.schoolName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.schoolName.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            {...register("address")}
            className={`w-full px-4 py-3 border ${
              errors.address ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* City */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            {...register("city")}
            className={`w-full px-4 py-3 border ${
              errors.city ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className={`w-full px-4 py-3 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* School Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Image
          </label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`w-full px-4 py-3 border ${
              errors.schoolImage ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.schoolImage && (
            <p className="text-red-500 text-xs mt-1">
              {errors.schoolImage.message}
            </p>
          )}
          <div className="mt-4">
            {isUploading && (
              <p className="text-gray-500 text-sm italic">Please wait, image uploading...</p>
            )}
            {imagePreview && !isUploading && (
              <CloudinaryContext cloudName="diua6dr4f">
                <CloudinaryImage
                  publicId={imageUrl}
                  alt="School Image Preview"
                  width="128"
                  height="128"
                  className="rounded-lg object-cover"
                />
              </CloudinaryContext>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
      <Toaster richColors/>
    </div>
  );
};

export default SchoolForm;
