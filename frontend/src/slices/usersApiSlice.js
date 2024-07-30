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
    googleLogin:builder.mutation({
      query:(data)=>({
         url:`${USERS_URL}/googleLogin`,
         method:'POST',
         body:data
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
      query: () => ({
        url: `${USERS_URL}/bookings`,
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
    getWalletTransactions: builder.query({
      query: () => ({
        url: `${USERS_URL}/wallet`,
        method: 'GET',
      }),
    }),
    getWalletBalance : builder.query({
      query: () => ({
        url: `${USERS_URL}/wallet/balance`,
        method: 'GET',
      }),
    }),
    addCashToWallet: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/wallet/add-cash`,
        method: 'POST',
        body: data,
      }),
    }),
    updateWallet: builder.mutation({
      query: (amount) => ({
        url: `${USERS_URL}/wallet/update`,
        method: 'PUT',
        body: { amount },
      }),
    }),
    addReview: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/add-review`,
        method: 'POST',
        body: data,
      }),
    }),
    getReviewsByHotelId: builder.query({
      query: (hotelId) => `${USERS_URL}/reviews/${hotelId}`,
    }),
    getReviews: builder.query({
      query: () => `${USERS_URL}/reviews`,
    }),
    cancelBooking: builder.mutation({
      query: ({ bookingId, refundMethod }) => ({
        url: `${USERS_URL}/cancel-booking/${bookingId}`,
        method: 'PUT',
        body: { refundMethod },
      }),
    }),
    fetchUnreadNotifications: builder.query({
      query: () => `${USERS_URL}/notifications/unread`,
    }),
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/notifications/${id}/read`,
        method: 'PUT',
      }),
    }),
    getChatRooms: builder.query({
      query: () => ({
        url: `${USERS_URL}/chatrooms`,
        method: 'GET',
      }),
    }),
    createChatRoom: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/chatrooms`,
        method: 'POST',
        body: data,
      }),
    }),
    getMessages: builder.query({
      query: (chatRoomId) => ({
        url: `${USERS_URL}/chatrooms/${chatRoomId}/messages`,
        method: 'GET',
      }),
    }),
    sendMessage: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/chatrooms/${data.chatRoomId}/messages`,
        method: 'POST',
        body: {
          content: data.content,
          senderType: data.senderType, 
        },
      }),
    }),
  })
})


export const { 
  useLoginMutation, 
  useGoogleLoginMutation,
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
  useCheckRoomAvailabilityMutation ,
  useGetWalletTransactionsQuery,
  useAddCashToWalletMutation,
  useGetWalletBalanceQuery,
  useUpdateWalletMutation,
  useAddReviewMutation,
  useGetReviewsByHotelIdQuery,
  useGetReviewsQuery,
  useCancelBookingMutation,
  useFetchUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGetChatRoomsQuery, 
  useCreateChatRoomMutation, 
  useGetMessagesQuery, 
  useSendMessageMutation
} = usersApiSlice