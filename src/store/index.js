import Vue from "vue"
import Vuex from "vuex"
import axios from "axios"

const formatDate = (date) => {
  return new Date(date).toLocaleString("tr-TR", {
    timeZone: "Turkey",
  })
}

const formatLoop = (array) => {
  array.forEach((member) => {
    member?.report_time?.forEach((report) => {
      report.join_time = formatDate(report.join_time)
      report.leave_time = formatDate(report.leave_time)
    })
  })
}

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    meetings: [],
    participants: [],
    reportPolling: {},
    loading: true,
  },
  getters: {
    getMeetings: (state) => state.meetings,
    getParticipants: (state) => state.participants,
    getReportPolling: (state) => state.reportPolling,
    getLoading: (state) => state.loading,
  },
  actions: {
    async fetchMeetings({ commit }) {
      let response = await axios.get(
        "https://zoom-polling.herokuapp.com/meetings"
      )

      commit("setMeetings", response.data)
    },
    async fetchParticipants({ commit, state }) {
      state.loading = true
      let response = await axios.get(
        `https://zoom-polling.herokuapp.com/participants`
      )

      response.data.forEach((participant) => {
        participant.join_time = formatDate(participant.join_time)
      })

      commit("setParticipants", response.data)
    },
    async fetchReportPolling({ commit, state }, meetingId) {
      state.loading = true
      let response = await axios.get(
        `https://zoom-polling.herokuapp.com/reportPolling/${meetingId}`
      )

      formatLoop(response.data.members)
      formatLoop(response.data.verified_members)
      formatLoop(response.data.declined_members)

      commit("setReportPolling", response.data)
    },
  },
  mutations: {
    setMeetings: (state, meetings) => (state.meetings = meetings),
    setParticipants: (state, participants) => {
      state.participants = participants
      state.loading = false
    },
    setReportPolling: (state, reportPolling) => {
      state.reportPolling = reportPolling
      state.loading = false
    },
  },
})
