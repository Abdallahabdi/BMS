import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Search, ShieldCheck, Package,
  X, Menu, Loader2, ArrowLeft
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../api/api';
import { toast } from 'react-toastify';

const UserMatchView = ({ toggleSidebar }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (id) fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/matches/${id}`);
      setMatch(res.data || null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch match details.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMine = async () => {
    if (!match?.found?._id) return;

    try {
      setConfirming(true);
      await API.post('/claims', { itemId: match.found._id });
      toast.success("Claim submitted successfully!");
      navigate('/user-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (!match || !match.lost || !match.found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <X size={50} className="text-red-500 mb-3" />
        <p className="font-bold">Match data not available</p>
        <button onClick={() => navigate('/user-dashboard')}>
          Back
        </button>
      </div>
    );
  }

  const { lost, found, score } = match;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAV */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="lg:hidden">
            <Menu />
          </button>

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <h1 className="font-black">BAAFIN.</h1>
      </nav>

      <div className="max-w-5xl mx-auto p-6">

        {/* HEADER */}
        <div className="text-center mb-6">
          <span className="text-green-600 font-bold text-xs">
            Potential Match Found
          </span>
          <h1 className="text-2xl font-bold mt-2">
            We found a possible match
          </h1>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* LOST */}
          <div className="bg-white p-5 rounded-xl">
            <p className="text-xs font-bold">YOUR ITEM</p>

            <div className="h-48 bg-slate-100 rounded-lg overflow-hidden mt-3">
              {lost.image ? (
                <img
                  src={getImageUrl(lost.image)}
                  className="w-full h-full object-cover"
                  alt="lost"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package />
                </div>
              )}
            </div>

            <h2 className="font-bold mt-3">{lost.itemName}</h2>
            <p className="text-xs text-gray-500">
              {lost.parkZone}
            </p>
            <p className="text-xs">
              {new Date(lost.dateTime).toLocaleDateString()}
            </p>
          </div>

          {/* FOUND */}
          <div className="bg-white p-5 rounded-xl border-2 border-green-500">
            <p className="text-xs font-bold text-green-600">
              {score}% MATCH
            </p>

            <div className="h-48 bg-slate-100 rounded-lg overflow-hidden mt-3">
              {found.image ? (
                <img
                  src={getImageUrl(found.image)}
                  className="w-full h-full object-cover"
                  alt="found"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package />
                </div>
              )}
            </div>

            <p className="text-xs mt-3">{found.description}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 mt-8 justify-center">

          <button
            onClick={handleConfirmMine}
            disabled={confirming}
            className="bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            {confirming ? "Processing..." : "This is mine"}
          </button>

          <button
            onClick={() => navigate('/user-dashboard')}
            className="border px-6 py-3 rounded-xl"
          >
            Not mine
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserMatchView;