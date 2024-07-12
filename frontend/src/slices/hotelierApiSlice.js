import { apiSlice } from './apiSlice';

const HOTELS_URL = '/api/hotels';

export const hotelierApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    hotelierLogin: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),
    hotelierRegister: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    hotelierVerifyOtp: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/verify-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    resendHotelierOtp: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/resend-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    hotelierLogout: builder.mutation({
      query: () => ({
        url: `${HOTELS_URL}/logout`,
        method: 'POST',
      }),
    }),
    getHotelierProfile: builder.query({
      query: () => ({
        url: `${HOTELS_URL}/profile`, 
        method: 'GET',
      }),
    }),
    hotelierUpdateUser: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    uploadVerificationDetails: builder.mutation({
      query: (formData) => ({
        url: `${HOTELS_URL}/verification`,
        method: 'POST',
        body: formData,
      }),
    }),
    
    addHotel: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/add-hotel`,
        method: 'POST',
        body: data,
      }),
    }),
    getHotels: builder.query({
      query: () => ({
        url: `${HOTELS_URL}/get-hotels`,
        method: 'GET',
      }),
    }),
    getHotelById: builder.query({
      query: (id) => ({
        url: `${HOTELS_URL}/${id}`,
        method: 'GET',
      }),
    }),
    updateHotel: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${HOTELS_URL}/${id}`,
        method: 'PUT',
        body: formData,
      }),
    }),
    addRoom: builder.mutation({
      query: ({ hotelId, formData }) => ({
        url: `${HOTELS_URL}/add-room/${hotelId}`,
        method: 'POST',
        body: formData,
      }),
    }),
    getRoomById: builder.query({
      query: (roomId) => `${HOTELS_URL}/rooms/${roomId}`,
    }),
    getHotelierBookings: builder.query({
      query: (id) => `${HOTELS_URL}/bookings/${id}`,
    }),
  }),
  
});

export const {
  useHotelierLoginMutation,
  useHotelierLogoutMutation,
  useHotelierRegisterMutation,
  useHotelierVerifyOtpMutation,
  useHotelierUpdateUserMutation,
  useUploadVerificationDetailsMutation,
  useAddHotelMutation,
  useGetHotelsQuery,
  useGetHotelByIdQuery,
  useUpdateHotelMutation,
  useGetHotelierProfileQuery,
  useResendHotelierOtpMutation,
  useAddRoomMutation,
  useGetRoomByIdQuery,
  useGetHotelierBookingsQuery
} = hotelierApiSlice;
