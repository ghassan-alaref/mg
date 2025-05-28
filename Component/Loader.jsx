import { InfinitySpin } from "react-loader-spinner";

export const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 flex items-center justify-center">
          <InfinitySpin
            visible={true}
            width="200" // Increase the width
            height="200"
            color="#00aa71"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      </div>
    </div>
  );
};
