import { apiSlice } from "./apiSlice.js";

const USERS_URL = '/api/users'

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder)=>({
    login: builder.mutation({
      query: (data)=>({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data
      })
    }),
    register: builder.mutation({
      query: (data)=>({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data
      })
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: ()=>({
        url: `${USERS_URL}/logout`,
        method: 'POST'
      })
    }),
    getUserProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`, 
        method: 'GET',
      }),
    }),
    updateUser: builder.mutation({
      query: (data)=>({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data
      })
    }),
    getHotelsData: builder.mutation({
      query: ({ sort = 'price_low_high', amenities = [], city = '' }) => ({
        url: `${USERS_URL}/hotels`,
        method: 'GET',
        params: { sort, amenities, city },
      }),
    }),
    
    
    getHotelById: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/hotels/${id}`,
        method: 'GET',
      }),
    }),
    checkRoomAvailability: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/check-availability`,
        method: 'POST',
        body: data,
      }),
    }),
    saveBooking: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/booking`,
        method: 'POST',
        body: data,
      }),
    }),
    updateBookingStatus: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/booking/update-status`,
        method: 'PUT',
        body: data,
      }),
    }),
    getBookings: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/bookings/${userId}`,
        method: 'GET',
      }),
    }),
    sendPasswordResetEmail: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password/${data.token}`,
        method: 'PUT',
        body: { password: data.password },
      }),
    }),
    getRoomsData: builder.mutation({
      query: (hotelIds) => ({
        url: `${USERS_URL}/rooms`,
        method: 'POST',
        body: { hotelIds },
      }),
    }),
  })
})


export const { 
  useLoginMutation, 
  useLogoutMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation, 
  useUpdateUserMutation,
  useGetHotelsDataMutation,
  useGetUserProfileQuery,
  useGetHotelByIdQuery,
  useSaveBookingMutation,
  useUpdateBookingStatusMutation,
  useGetBookingsQuery,
  useSendPasswordResetEmailMutation,
  useResetPasswordMutation,
  useGetRoomsDataMutation,
  useCheckRoomAvailabilityMutation 
} = usersApiSlice