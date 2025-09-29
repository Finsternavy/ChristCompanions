import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStudyGroupsStore = defineStore('studyGroups', () => {
  // Mock study group data - Sarah Johnson is the owner
  const mockStudyGroup = {
    id: 'group_1',
    name: 'Genesis Study Group',
    description: 'Deep dive into the book of Genesis',
    createdBy: 'sarah.johnson@example.com',
    members: [
      {
        id: 'user_2',
        email: 'sarah.johnson@example.com',
        name: 'Sarah Johnson',
        role: 'admin', // Sarah is the group owner
        joinedAt: '2024-01-10T09:00:00Z',
      },
      {
        id: 'chris.finster@inclusivemedium.com',
        email: 'chris.finster@inclusivemedium.com',
        name: 'Chris Finster',
        role: 'member', // Chris is just a member
        joinedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'user_3',
        email: 'michael.chen@example.com',
        name: 'Michael Chen',
        role: 'member', // Michael is just a member
        joinedAt: '2024-01-20T14:15:00Z',
      },
    ],
  }

  // State
  const studyGroups = ref([mockStudyGroup])
  const pendingInvitations = ref([
    {
      id: 'invitation_1',
      groupId: 'group_1',
      groupName: 'Genesis Study Group',
      fromUser: {
        id: 'user_2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
      },
      message: 'Would you like to join our Genesis study group?',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'invitation_2',
      groupId: 'group_2',
      groupName: 'New Testament Study',
      fromUser: {
        id: 'user_3',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
      },
      message: 'Join us for a deep dive into the New Testament!',
      createdAt: '2024-01-20T14:15:00Z',
    },
  ])
  const sentInvitations = ref([
    {
      id: 'sent_invitation_1',
      groupId: 'group_1',
      groupName: 'Genesis Study Group',
      toUser: {
        id: 'user_4',
        name: 'David Wilson',
        email: 'david.wilson@example.com',
      },
      message: 'Would you like to join our Genesis study group?',
      sentAt: '2024-01-18T09:00:00Z',
      status: 'pending',
    },
    {
      id: 'sent_invitation_2',
      groupId: 'group_1',
      groupName: 'Genesis Study Group',
      toUser: {
        id: 'user_5',
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
      },
      message: 'Join us for a deep dive into Genesis!',
      sentAt: '2024-01-19T14:30:00Z',
      status: 'pending',
    },
  ])
  const allUsers = ref([
    {
      id: 'user_2',
      email: 'sarah.johnson@example.com',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      joinedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'user_3',
      email: 'michael.chen@example.com',
      name: 'Michael Chen',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      joinedAt: '2024-01-20T14:15:00Z',
    },
    {
      id: 'user_4',
      email: 'david.wilson@example.com',
      name: 'David Wilson',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      joinedAt: '2024-01-18T09:00:00Z',
    },
    {
      id: 'user_5',
      email: 'emily.davis@example.com',
      name: 'Emily Davis',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      joinedAt: '2024-01-19T14:30:00Z',
    },
  ])
  const showOtherUsersContent = ref(true)

  // Mock data - 2 additional users with Genesis chapter 1 notes and questions
  const mockUsers = [
    {
      id: 'user_2',
      email: 'sarah.johnson@example.com',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      joinedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'user_3',
      email: 'michael.chen@example.com',
      name: 'Michael Chen',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      joinedAt: '2024-01-20T14:15:00Z',
    },
  ]

  // Mock notes and questions from other users - structured like user notes
  const mockOtherUsersNotes = [
    // Verse level notes
    {
      id: 'note_sarah_1',
      userId: 'user_2',
      userEmail: 'sarah.johnson@example.com',
      userName: 'Sarah Johnson',
      text: 'I love how this verse establishes God as the creator from the very beginning. It sets the foundation for everything that follows.',
      book: 'Genesis',
      chapter: 1,
      verse: 1,
      noteKey: 'Genesis_1_1',
      createdAt: '2024-01-16T08:30:00Z',
    },
    {
      id: 'note_michael_1',
      userId: 'user_3',
      userEmail: 'michael.chen@example.com',
      userName: 'Michael Chen',
      text: 'The phrase "Let there be light" is so powerful. It shows God\'s authority - He simply speaks and it happens.',
      book: 'Genesis',
      chapter: 1,
      verse: 3,
      noteKey: 'Genesis_1_3',
      createdAt: '2024-01-21T16:45:00Z',
    },
    {
      id: 'note_michael_2',
      userId: 'user_3',
      userEmail: 'michael.chen@example.com',
      userName: 'Michael Chen',
      text: "What does it mean to be made in God's image? This is such a profound concept that affects how we view ourselves and others.",
      book: 'Genesis',
      chapter: 1,
      verse: 26,
      noteKey: 'Genesis_1_26',
      createdAt: '2024-01-21T18:00:00Z',
    },
    // Chapter level notes
    {
      id: 'note_sarah_2',
      userId: 'user_2',
      userEmail: 'sarah.johnson@example.com',
      userName: 'Sarah Johnson',
      text: "The creation story shows God's intentionality and order. Each day builds upon the previous one, showing a divine plan.",
      book: 'Genesis',
      chapter: 1,
      noteKey: 'Genesis_chapter_1',
      createdAt: '2024-01-16T09:15:00Z',
    },
    {
      id: 'note_michael_3',
      userId: 'user_3',
      userEmail: 'michael.chen@example.com',
      userName: 'Michael Chen',
      text: 'I find it interesting that God created light before the sun, moon, and stars. This suggests that God Himself is the source of light.',
      book: 'Genesis',
      chapter: 1,
      noteKey: 'Genesis_chapter_1',
      createdAt: '2024-01-21T17:20:00Z',
    },
    // Book level notes
    {
      id: 'note_sarah_3',
      userId: 'user_2',
      userEmail: 'sarah.johnson@example.com',
      userName: 'Sarah Johnson',
      text: 'Genesis is such a foundational book. It sets up everything we need to understand about God, humanity, and our relationship with Him.',
      book: 'Genesis',
      noteKey: 'Genesis_book',
      createdAt: '2024-01-16T12:00:00Z',
    },
    {
      id: 'note_michael_4',
      userId: 'user_3',
      userEmail: 'michael.chen@example.com',
      userName: 'Michael Chen',
      text: 'The book of Genesis answers the fundamental questions: Where did we come from? Why are we here? What went wrong?',
      book: 'Genesis',
      noteKey: 'Genesis_book',
      createdAt: '2024-01-21T20:00:00Z',
    },
  ]

  const mockOtherUsersQuestions = [
    // Verse level questions
    {
      id: 'question_sarah_1',
      userId: 'user_2',
      userEmail: 'sarah.johnson@example.com',
      userName: 'Sarah Johnson',
      text: 'What does it mean that the earth was "formless and empty"? Was there something there before God started creating?',
      book: 'Genesis',
      chapter: 1,
      verse: 1,
      noteKey: 'Genesis_1_1',
      createdAt: '2024-01-16T10:00:00Z',
    },
    {
      id: 'question_michael_1',
      userId: 'user_3',
      userEmail: 'michael.chen@example.com',
      userName: 'Michael Chen',
      text: "What does it mean to be made in God's image? How does this affect how we should treat each other?",
      book: 'Genesis',
      chapter: 1,
      verse: 26,
      noteKey: 'Genesis_1_26',
      createdAt: '2024-01-21T18:00:00Z',
    },
    // Chapter level questions
    {
      id: 'question_sarah_2',
      userId: 'user_2',
      userEmail: 'sarah.johnson@example.com',
      userName: 'Sarah Johnson',
      text: 'Why did God rest on the seventh day? Does God need rest, or is there a deeper meaning here?',
      book: 'Genesis',
      chapter: 1,
      noteKey: 'Genesis_chapter_1',
      createdAt: '2024-01-16T11:30:00Z',
    },
    {
      id: 'question_michael_2',
      userId: 'user_3',
      userEmail: 'michael.chen@example.com',
      userName: 'Michael Chen',
      text: 'How do we reconcile the creation account with scientific theories about the age of the earth?',
      book: 'Genesis',
      chapter: 1,
      noteKey: 'Genesis_chapter_1',
      createdAt: '2024-01-21T19:15:00Z',
    },
    // Book level questions
    {
      id: 'question_sarah_3',
      userId: 'user_2',
      userEmail: 'sarah.johnson@example.com',
      userName: 'Sarah Johnson',
      text: 'What are the main themes we should look for as we study Genesis?',
      book: 'Genesis',
      noteKey: 'Genesis_book',
      createdAt: '2024-01-16T13:00:00Z',
    },
    {
      id: 'question_michael_3',
      userId: 'user_3',
      userEmail: 'michael.chen@example.com',
      userName: 'Michael Chen',
      text: 'How does Genesis prepare us for the rest of the Bible? What patterns are established here?',
      book: 'Genesis',
      noteKey: 'Genesis_book',
      createdAt: '2024-01-21T21:00:00Z',
    },
  ]

  // Initialize mock data
  const initializeMockData = () => {
    studyGroups.value = [mockStudyGroup]
    allUsers.value = mockUsers
    // Add some pending invitations for demo
    pendingInvitations.value = [
      {
        id: 'invite_1',
        fromUser: {
          email: 'pastor.smith@church.com',
          name: 'Pastor Smith',
        },
        groupName: 'Sunday School Study',
        message: 'Would you like to join our Sunday School study group?',
        sentAt: '2024-01-22T10:00:00Z',
      },
    ]
  }

  // Actions
  const searchUsers = (query) => {
    if (!query.trim()) return []
    return allUsers.value.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()),
    )
  }

  const sendInvitation = (userEmail, groupId, message = '') => {
    // Check if current user is the group owner
    const group = studyGroups.value.find((g) => g.id === groupId)
    if (!group) {
      throw new Error('Group not found')
    }

    // Check if current user is the group owner (admin role)
    const currentUser = group.members.find((m) => m.email === 'chris.finster@inclusivemedium.com')
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only group owners can send invitations')
    }

    // Find the user in allUsers to get their full info
    const user = allUsers.value.find((u) => u.email === userEmail)

    const invitation = {
      id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      groupId,
      groupName: group?.name || 'Unknown Group',
      toUser: {
        id: user?.id || `user_${Date.now()}`,
        name: user?.name || userEmail.split('@')[0],
        email: userEmail,
      },
      message,
      sentAt: new Date().toISOString(),
      status: 'pending',
    }
    sentInvitations.value.push(invitation)
    return invitation
  }

  const acceptInvitation = (invitationId) => {
    const invitation = pendingInvitations.value.find((inv) => inv.id === invitationId)
    if (invitation) {
      // Check if group exists
      let group = studyGroups.value.find((g) => g.id === invitation.groupId)

      // If group doesn't exist, create it
      if (!group) {
        group = {
          id: invitation.groupId,
          name: invitation.groupName,
          description: `Study group created by ${invitation.fromUser.name}`,
          createdBy: invitation.fromUser.id,
          members: [
            {
              id: invitation.fromUser.id,
              email: invitation.fromUser.email,
              name: invitation.fromUser.name,
              role: 'admin',
              joinedAt: invitation.createdAt,
            },
          ],
          createdAt: invitation.createdAt,
        }
        studyGroups.value.push(group)
      }

      // Add current user to group
      group.members.push({
        id: 'current_user',
        email: 'chris.finster@inclusivemedium.com',
        name: 'Chris Finster',
        role: 'member',
        joinedAt: new Date().toISOString(),
      })

      // Remove from pending
      pendingInvitations.value = pendingInvitations.value.filter((inv) => inv.id !== invitationId)
    }
  }

  const rejectInvitation = (invitationId) => {
    pendingInvitations.value = pendingInvitations.value.filter((inv) => inv.id !== invitationId)
  }

  const cancelSentInvitation = (invitationId) => {
    const invitation = sentInvitations.value.find((inv) => inv.id === invitationId)
    if (!invitation) return

    // Check if current user is the group owner
    const group = studyGroups.value.find((g) => g.id === invitation.groupId)
    if (!group) return

    const currentUser = group.members.find((m) => m.email === 'chris.finster@inclusivemedium.com')
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only group owners can cancel invitations')
    }

    sentInvitations.value = sentInvitations.value.filter((inv) => inv.id !== invitationId)
  }

  const canManageGroup = (groupId) => {
    const group = studyGroups.value.find((g) => g.id === groupId)
    if (!group) return false

    const currentUser = group.members.find((m) => m.email === 'chris.finster@inclusivemedium.com')
    return currentUser && currentUser.role === 'admin'
  }

  const createStudyGroup = (name, description) => {
    const newGroup = {
      id: `group_${Date.now()}`,
      name,
      description,
      createdBy: 'chris.finster@inclusivemedium.com',
      members: [
        {
          id: 'chris.finster@inclusivemedium.com',
          email: 'chris.finster@inclusivemedium.com',
          name: 'Chris Finster',
          role: 'admin',
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    }
    studyGroups.value.push(newGroup)
    return newGroup
  }

  const getOtherUsersNotes = (book, chapter, verse = null) => {
    if (!book) return []

    return mockOtherUsersNotes.filter((note) => {
      const bookMatch = note.book.toLowerCase() === book.toLowerCase()

      // If no chapter/verse parameters provided, return all notes for the book
      if (chapter === null || chapter === undefined) {
        return bookMatch
      }

      // Verse level: must match book, chapter, and verse
      if (verse !== null && verse !== undefined) {
        return bookMatch && note.chapter === chapter && note.verse === verse
      }
      // Chapter level: must match book and chapter, no verse
      else {
        return (
          bookMatch && note.chapter === chapter && (note.verse === undefined || note.verse === null)
        )
      }
    })
  }

  const getOtherUsersQuestions = (book, chapter, verse = null) => {
    if (!book) return []

    return mockOtherUsersQuestions.filter((question) => {
      const bookMatch = question.book.toLowerCase() === book.toLowerCase()

      // If no chapter/verse parameters provided, return all questions for the book
      if (chapter === null || chapter === undefined) {
        return bookMatch
      }

      // Verse level: must match book, chapter, and verse
      if (verse !== null && verse !== undefined) {
        return bookMatch && question.chapter === chapter && question.verse === verse
      }
      // Chapter level: must match book and chapter, no verse
      else {
        return (
          bookMatch &&
          question.chapter === chapter &&
          (question.verse === undefined || question.verse === null)
        )
      }
    })
  }

  const toggleOtherUsersContent = () => {
    showOtherUsersContent.value = !showOtherUsersContent.value
  }

  // Test function to verify verse-level filtering
  const testVerseLevel = () => {
    console.log('🧪 Testing verse-level filtering...')

    // Test Genesis 1:1 (should show Sarah's note and question)
    console.log('📖 Testing Genesis 1:1:')
    const verse1Notes = getOtherUsersNotes('Genesis', 1, 1)
    const verse1Questions = getOtherUsersQuestions('Genesis', 1, 1)
    console.log(
      `Found ${verse1Notes.length} notes and ${verse1Questions.length} questions for Genesis 1:1`,
    )

    // Test Genesis 1:3 (should show Michael's note)
    console.log('📖 Testing Genesis 1:3:')
    const verse3Notes = getOtherUsersNotes('Genesis', 1, 3)
    const verse3Questions = getOtherUsersQuestions('Genesis', 1, 3)
    console.log(
      `Found ${verse3Notes.length} notes and ${verse3Questions.length} questions for Genesis 1:3`,
    )

    // Test Genesis 1:26 (should show Michael's note and question)
    console.log('📖 Testing Genesis 1:26:')
    const verse26Notes = getOtherUsersNotes('Genesis', 1, 26)
    const verse26Questions = getOtherUsersQuestions('Genesis', 1, 26)
    console.log(
      `Found ${verse26Notes.length} notes and ${verse26Questions.length} questions for Genesis 1:26`,
    )
  }

  // Initialize mock data on store creation
  initializeMockData()

  return {
    // State
    studyGroups,
    pendingInvitations,
    sentInvitations,
    allUsers,
    showOtherUsersContent,

    // Actions
    searchUsers,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    cancelSentInvitation,
    canManageGroup,
    createStudyGroup,
    getOtherUsersNotes,
    getOtherUsersQuestions,
    toggleOtherUsersContent,
    testVerseLevel,
  }
})
