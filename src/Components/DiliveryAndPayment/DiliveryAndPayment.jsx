import React, { useState, useEffect, useRef } from 'react';
import QrCode from '../../assets/paymentImage/qrcode.png';

// 25 Official Provinces of Cambodia
const cambodiaProvinces = [
  "Phnom Penh", "Banteay Meanchey", "Battambang", "Kampong Cham", "Kampong Chhnang",
  "Kampong Speu", "Kampong Thom", "Kampot", "Kandal", "Koh Kong", "Kratié",
  "Mondulkiri", "Oddar Meanchey", "Pailin", "Preah Vihear", "Prey Veng",
  "Pursat", "Ratanakiri", "Siem Reap", "Sihanoukville", "Stung Treng",
  "Svay Rieng", "Takeo", "Tbong Khmum", "Kep"
];

// === SEARCHABLE PROVINCE SELECT ===
function ProvinceSearchSelect({ onProvinceChange }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const filteredProvinces = cambodiaProvinces.filter(p =>
    p.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (province) => {
    setSelected(province);
    setQuery(province);
    setIsOpen(false);
    onProvinceChange(province);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setSelected('');
          onProvinceChange('');
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search or select province..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        required
      />

      <select
        name="province"
        value={selected}
        onChange={() => {}}
        className="hidden"
        required
      >
        <option value="">Select province</option>
        {cambodiaProvinces.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredProvinces.length > 0 ? (
            filteredProvinces.map(p => (
              <div
                key={p}
                onClick={() => handleSelect(p)}
                className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-gray-800 transition"
              >
                {p}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 italic">No provinces found</div>
          )}
        </div>
      )}
    </div>
  );
}

// === FILE UPLOAD WITH REMOVE BUTTON ===
function FileUploadWithRemove() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    document.getElementById('proof-of-address-input').value = '';
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        id="proof-of-address-input"
        name="proof-of-address"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="hidden"
      />

      <label
        htmlFor="proof-of-address-input"
        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-medium text-sm rounded-full hover:bg-purple-100 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Choose File
      </label>

      {file && (
        <div className="flex items-end gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <svg className="w-5 h-5 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-purple-900 font-medium truncate max-w-[180px]">
            {file.name}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className=" -left-20 ml-auto w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-red-600 transition text-xs font-bold"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}

// === MAIN COMPONENT ===
const DiliveryAndPayment = ({ onClose }) => {
  const [paymentType, setPaymentType] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  const handleProvinceChange = (province) => {
    setSelectedProvince(province);
  };

  // Show QR Code only for ABA or WING
  const showQrCode = paymentType === 'aba' || paymentType === 'wing' || paymentType === 'acelida';

  const handleSubmit = (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('proof-of-address-input');
    const file = fileInput.files[0];

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      gender: e.target.gender.value,
      phone: e.target.phone.value,
      address: e.target['address-line-2'].value,
      province: selectedProvince,
      state: e.target.state.value,
      country: e.target.country.value,
      purpose: e.target.purpose.value,
      paymentType,
      cardNumber: e.target.card_number.value,
      expDate: e.target.exp_date.value,
      proofOfAddress: file ? file.name : null,
    };

    console.log('Form Submitted:', formData);
  };

  return (
    <div className="bg-white py-8 px-4 flex flex-col items-end justify-end font-sans">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <div className='w-full flex justify-end'>
          <div className='absolute'>
            <button onClick={onClose} className='text-black text-xl font-bold hover:text-2xl transition duration-3000 active:text-xl '>X</button>
          </div>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Payment Form</h2>
          <p className="text-sm text-gray-600 mt-1">Required fields are followed by :</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* === CONTACT INFORMATION === */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-4">

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Full Name 
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="email2" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address 
                </label>
                <input
                  type="email"
                  id="email2"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
                <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <fieldset className="border border-gray-300 rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-700 px-2">Gender </legend>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value="male" required className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value="female" required className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">Female</span>
                  </label>
                </div>
              </fieldset>

              <hr className="my-5 border-gray-300" />

              {/* === RESIDENTIAL ADDRESS === */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Residential Address</h3>
              <div>
                <label htmlFor="address-line-2" className="block text-sm font-medium text-gray-700 mb-1">
                  Home Number
                </label>
                <input
                  type="text"
                  id="address-line-2"
                  name="address-line-2"
                  placeholder="Enter house number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="address-line-2" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address-line-2"
                  name="address-line-2"
                  placeholder="House, Street, Village..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <ProvinceSearchSelect onProvinceChange={handleProvinceChange} />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  District / Commune
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="District, Commune, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                >
                  <option value="Cambodia">Cambodia</option>
                </select>
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Form (Optional)
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                >
                  <option value="new-address">New Address</option>
                  <option value="address-update">Address Update</option>
                  <option value="delivery-address">Delivery Address</option>
                  <option value="billing-address">Billing Address</option>
                  <option value="permanent-address">Permanent Address</option>
                </select>
              </div>

              {/* === FILE UPLOAD WITH X BUTTON === */}
              <div>
                <label htmlFor="proof-of-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Proof of Address (Optional)
                </label>
                <FileUploadWithRemove />
              </div>
            </div>
          </div>

          <hr className="border-gray-300" />

          {/* === PAYMENT INFORMATION === */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h3>
            <div className="space-y-4">

              <div>
                <label htmlFor="card_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Types of Payment
                </label>
                <select
                  id="card_type"
                  name="card_type"
                  required
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                >
                  {paymentType === '' && (
                    <option value="" disabled hidden>
                      Select payment type
                    </option>
                  )}
                  <option value="aba">ABA</option>
                  <option value="acelida">ACELIDA</option>
                  <option value="wing">WING</option>
                </select>
              </div>

              {/* QR CODE - ONLY SHOW FOR ABA OR WING */}
              {showQrCode && (
                <div className="flex justify-start my-4">
                  <img
                    src={QrCode}
                    alt="QR Code for Payment"
                    className="w-50 h-60 "
                  />
                </div>
              )}

              <div>
                <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  id="card_number"
                  name="card_number"
                  required
                  pattern="[0-9\s]{13,19}"
                  maxLength="19"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="exp_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date
                </label>
                <input
                  type="month"
                  id="exp_date"
                  name="exp_date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition shadow-md"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiliveryAndPayment;