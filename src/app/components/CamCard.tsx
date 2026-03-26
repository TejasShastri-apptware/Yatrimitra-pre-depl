import React from 'react'
import { Camera } from '../types/floorplan';

const CamCard = ({ camera, onClick }: { camera: Camera, onClick: () => void }) => {
    // Mock data to match the visual specification context
    const mockData = {
        assignedRPF: "mock user",
        capacity: "6767 people",
        currentStatus: "67 people",
        crowdType: "Moving",
        note: "Common note declared in mockdata",
        zone: "{zone declaration is not implemented yet}",
        noteBg: "#F6EED8"
    };

    return (
        <div
            onClick={onClick}
            className="hover:scale-105 transition-all duration-350 flex flex-col items-start p-0 gap-[25.72px] bg-slate-900 border border-[#F5EFFC] rounded-[11.43px] w-full max-w-[287.71px] h-[421.08px] overflow-hidden flex-none order-0 grow cursor-pointer font-['Poppins',sans-serif] relative"
        >
            {/* Header Image section */}
            <div className="relative w-[255.32px] h-[83.84px] ml-[16.2px] mt-[16.2px] rounded-[5px] overflow-hidden bg-slate-200">
                <div
                    className="absolute inset-0 bg-linear-to-b from-[rgba(0,0,0,0.12)] to-[rgba(0,0,0,0.3)] z-10"
                />
                <img
                    src={camera.rtspUrl 
                        ? `http://localhost:8000/api/stream?url=${encodeURIComponent(camera.rtspUrl)}&fps=15`
                        : `http://localhost:8000/api/stream?fps=15`
                    }
                    alt="Camera Feed"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to static image if stream fails
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1473442240418-452f03b7ae40?auto=format&fit=crop&q=80&w=400";
                    }}
                />
                <div className="absolute left-[8.57px] bottom-[6.67px] z-20">
                    <span className="text-white text-[11.43px] font-medium leading-[17px]">
                        {camera.id ? `Camera id - ${camera.id.slice(-6)}` : 'camID inaccessible'}
                    </span>
                </div>
            </div>

            {/* Stats Section */}
            <div className="flex flex-col justify-center items-center p-0 gap-[18.1px] absolute w-[222.93px] h-[41.92px] left-[13.62px] top-[119.08px] isolate">

                {/* Icon + Title */}
                <div className="flex flex-col justify-center items-start p-0 gap-[14.29px] absolute w-[209.1px] h-[152.58px] left-[2.53px] top-0 z-0">

                    {/* RPF Row */}
                    <div className="flex flex-row items-start p-0 gap-[18.1px] w-[152.02px] h-[46px] flex-none order-0 grow-0">
                        <div className="flex flex-col justify-center items-center p-[3.81px] w-[41.92px] h-[41.92px] bg-[#E5E4FF] rounded-[7.62px] flex-none order-0 grow-0">
                            {/* Bulhorn/Megaphone icon representation */}
                            <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5.5H5.5M1 5.5V10.5M1 5.5L7 1.5V14.5L1 10.5M5.5 5.5L13.5 1.5V14.5L5.5 10.5" stroke="#362BA2" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="w-[92px] h-[46px] flex-none order-1 grow-0 font-medium text-[11.43px] leading-[17px] text-slate-200">
                            Assigned RPF<br />{mockData.assignedRPF}
                        </div>
                    </div>

                    {/* Capacity/Status Row */}
                    <div className="flex flex-row items-start p-0 gap-[18.1px] w-[209.1px] h-[39px] flex-none order-1 grow-0">
                        <div className="w-[95px] h-[39px] flex-none order-0 grow-0 font-medium text-[8.57px] leading-[13px] uppercase text-slate-200">
                            Capacity<br />{mockData.capacity}
                        </div>
                        <div className="w-[96px] h-[39px] flex-none order-1 grow-0 font-medium text-[8.57px] leading-[13px] uppercase text-slate-200">
                            Current Status<br />{mockData.currentStatus}
                        </div>
                    </div>

                    {/* Crowd Type Row */}
                    <div className="flex flex-row items-start p-0 gap-[18.1px] w-[58px] h-[39px] flex-none order-2 grow-0">
                        <div className="w-[58px] h-[39px] flex-none order-0 grow-0 font-medium text-[8.57px] leading-[13px] uppercase text-slate-200">
                            Crowd Type<br />{mockData.crowdType}
                        </div>
                    </div>
                </div>
            </div>

            {/* Note Section */}
            <div
                className="flex flex-row items-center p-[9.53px] gap-[9.53px] absolute w-[259.13px] h-[70.05px] left-[13.38px] top-[283.91px]"
                style={{ backgroundColor: mockData.noteBg }}
            >
                <div className="w-[158px] h-[51px] flex-none order-0 grow-0 font-normal text-[11.43px] leading-[17px] text-[#1F1D39]">
                    Note:<br />{mockData.note}
                </div>
            </div>

            {/* Footer Alert Button */}
            <div className="flex flex-row justify-center items-center p-[7.62px_15.24px] gap-[7.62px] absolute w-[259.13px] h-[34.3px] left-[13.38px] top-[369.64px] bg-[#362BA2] rounded-[7.62px]">
                {/* Bell icon representation */}
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.5 16.5V17.5M4 14.5C4 14.5 5 13.5 5 11.5V7.5C5 5.01472 7.01472 3 9.5 3C11.9853 3 14 5.01472 14 7.5V11.5C14 13.5 15 14.5 15 14.5M3 14.5H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="w-auto h-auto flex-none order-1 grow-0 font-medium text-[13.34px] leading-[17px] text-white">
                    Send alert
                </span>
            </div>
        </div>
    )
}

export default CamCard;

