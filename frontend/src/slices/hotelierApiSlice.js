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
    hotelierLogout: builder.mutation({
      query: () => ({
        url: `${HOTELS_URL}/logout`,
        method: 'POST',
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
      query: (data) => ({
        url: `${HOTELS_URL}/verification`,
        method: 'POST',
        body: data,
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
      query: ({ id, ...hotel }) => ({
        url: `${HOTELS_URL}/${id}`,
        method: 'PUT',
        body: hotel,
      }),
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
  useUpdateHotelMutation
} = hotelierApiSlice;
