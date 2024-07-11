import React from 'react'

const Skeleton = () => {
    return (
        <div className="flex flex-col gap-4 m-3 lg:m-5">
            <div className="flex items-center gap-4">
                <div className="skeleton h-full lg:h-28 w-28 bg-gray-300 rounded-lg"></div>
                <div className="flex flex-col gap-3">
                    <div className="skeleton bg-gray-500 h-4 w-40"></div>
                    <div className="skeleton bg-gray-500 h-4 w-52 lg:w-72"></div>
                    <div className="skeleton bg-gray-500 h-4 w-52 lg:w-72"></div>
                    <div className="skeleton bg-gray-500 h-4 w-52 lg:w-72"></div>
                </div>
            </div>
        </div>
    )
}

export default Skeleton
