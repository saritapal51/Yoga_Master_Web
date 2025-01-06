import React, { useEffect, useState } from 'react'
import useAxiosFetch from '../../../Hooks/useAxiosFetch'


const PopularTeacher = () => {
    const [Instructors, setInstructors]= useState([]);
    const axiosFetch = useAxiosFetch();
     useEffect(() => {
        const fetchClasses = async () => {
          const response = await axiosFetch.get('/classes');
          // console.log(response.data)
          setInstructors(response.data)
        }
        fetchClasses();
      },[ ])
      // console.log(classes)
  return (
    <div className="md:w-[80%] mx-auto my-36">
      <div>
        <h1 className="text-5xl font-bold text-center">
          Our <span className="text-secondary"> Best </span>Instructors
        </h1>
        <div className="w-[40%] text-center mx-auto my-4">
          <p className="text-gray-500">
            Explore our Popular Classes. Here is some Popular Classes based on
            How many student enrolled{" "}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      </div>
    </div>
  );
};

export default PopularTeacher;
