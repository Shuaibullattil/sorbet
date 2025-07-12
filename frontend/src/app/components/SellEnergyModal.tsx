import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import api from "../lib/axios";

interface SellEnergyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SellEnergyModal: React.FC<SellEnergyModalProps> = ({ open, onClose, onSuccess }) => {
  const [units, setUnits] = useState(0);
  const [availableUnits, setAvailableUnits] = useState<number | null>(null);
  const [unitsForSell, setUnitsForSell] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Helper function to safely extract error message
  const extractErrorMessage = (err: any): string => {
    try {
      // Always return a string, never an object
      const errData = err?.response?.data;
      
      // Handle string responses
      if (typeof errData === "string") {
        return errData;
      }
      
      // Handle object responses - check common fields
      if (errData && typeof errData === 'object') {
        // Check for detail field
        if (errData.detail && typeof errData.detail === 'string') {
          return errData.detail;
        }
        
        // Check for message field
        if (errData.message && typeof errData.message === 'string') {
          return errData.message;
        }
        
        // Check for msg field
        if (errData.msg && typeof errData.msg === 'string') {
          return errData.msg;
        }
        
        // Handle validation errors (array format)
        if (Array.isArray(errData) && errData.length > 0) {
          const firstError = errData[0];
          if (firstError && typeof firstError === 'object' && firstError.msg && typeof firstError.msg === 'string') {
            return firstError.msg;
          }
          if (typeof firstError === 'string') {
            return firstError;
          }
        }
      }
      
      // Fallback to axios error message
      if (err?.message && typeof err.message === 'string') {
        return err.message;
      }
      
      // Final fallback
      return "An unexpected error occurred.";
      
    } catch (parseError) {
      console.error("Error parsing error message:", parseError);
      return "Failed to parse error response.";
    }
  };

  // Reset modal state when closed
  const resetModalState = () => {
    setUnits(0);
    setAvailableUnits(null);
    setUnitsForSell(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
    setFetching(false);
  };

  // Fetch unit status when modal opens
  useEffect(() => {
    if (open) {
      setFetching(true);
      setError(null);
      setSuccess(false);
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setFetching(false);
        return;
      }
      
      api.get("/grid/get_unit_status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          try {
            const data = res.data as { units: number; units_for_sell: number };
            setAvailableUnits(data.units || 0);
            setUnitsForSell(data.units_for_sell || 0);
          } catch (parseError) {
            setError("Failed to parse unit status data.");
          }
          setFetching(false);
        })
        .catch(err => {
          const errorMessage = extractErrorMessage(err);
          setError(errorMessage);
          setFetching(false);
        });
    } else {
      resetModalState();
    }
  }, [open]);

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validation
    if (!units || units <= 0) {
      setError("Please enter a positive number of units.");
      setLoading(false);
      return;
    }
    
    if (availableUnits !== null && units > availableUnits) {
      setError(`You cannot sell more than ${availableUnits} units.`);
      setLoading(false);
      return;
    }
    
    try {
      // Placeholder: Mint tokens to user wallet if contract supports it
      // const { address, isConnected } = useWallet();
      // if (isConnected && address) {
      //   const provider = new ethers.BrowserProvider((window as any).ethereum);
      //   const signer = await provider.getSigner();
      //   const contract = new ethers.Contract(
      //     process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      //     PowerShareAbi,
      //     signer
      //   );
      //   const tx = await contract.mint(address, ethers.parseUnits(units.toString(), 18));
      //   await tx.wait();
      // }
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }
      const res = await api.post(
        "/grid/sell_units",
        { units },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Parse response safely
      const data = res.data as { units: number; units_for_sell: number; message?: string };
      setAvailableUnits(data.units || 0);
      setUnitsForSell(data.units_for_sell || 0);
      setSuccess(true);
      
      // Call success callback if provided
      if (onSuccess) {
        try {
          await onSuccess();
        } catch (callbackError) {
          console.warn("Success callback failed:", callbackError);
        }
      }
      
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Sell Energy Units</h2>
                  <p className="text-gray-600">Move your available units to the sell pool</p>
                </div>
                
                {fetching ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mb-4"></div>
                    <span className="text-gray-500">Loading your unit status...</span>
                  </div>
                ) : success ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-green-700 mb-2">Success!</h3>
                    <p className="text-gray-600 mb-4">Your units have been moved to the sell pool.</p>
                    <button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSell}>
                    <div className="flex justify-between items-center bg-yellow-50 rounded-lg p-4">
                      <span className="text-gray-700 font-medium">Available Units:</span>
                      <span className="font-bold text-yellow-800 text-lg">
                        {availableUnits !== null ? availableUnits.toString() : "-"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-yellow-50 rounded-lg p-4">
                      <span className="text-gray-700 font-medium">Units for Sale:</span>
                      <span className="font-bold text-yellow-800 text-lg">
                        {unitsForSell !== null ? unitsForSell.toString() : "-"}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Units to Sell
                      </label>
                      <input
                        type="number"
                        value={units}
                        onChange={e => setUnits(parseInt(e.target.value) || 0)}
                        className="w-full border-2 border-yellow-300 rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors"
                        min={1}
                        max={availableUnits || undefined}
                        placeholder="Enter units to sell"
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Selling...
                          </span>
                        ) : (
                          "Sell Units"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SellEnergyModal;