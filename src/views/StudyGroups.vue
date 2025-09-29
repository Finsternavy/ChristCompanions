<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-secondary-lt pt-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Study Groups</h1>
        <p class="text-gray-600">Connect with others and study the Bible together</p>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
              :class="{
                'border-primary text-primary': activeTab === tab.id,
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                  activeTab !== tab.id,
              }"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- My Groups Tab -->
      <div v-if="activeTab === 'groups'" class="space-y-8">
        <!-- My Groups -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">My Groups</h3>
          <div v-if="groupsIOwn.length === 0" class="text-gray-500 text-center py-8">
            You don't own any groups yet. Create your first group!
          </div>
          <div v-else class="grid gap-4 md:grid-cols-2 items-start">
            <div
              v-for="group in groupsIOwn"
              :key="group.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <!-- Group Content (slides out when invite form is shown) -->
              <div v-if="!showInviteForm[group.id]" class="transition-all duration-300 ease-in-out">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900">{{ group.name }}</h4>
                    <p class="text-gray-600 text-sm">{{ group.description }}</p>
                  </div>
                  <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {{ group.members.length }} member{{ group.members.length !== 1 ? 's' : '' }}
                  </span>
                </div>

                <div class="space-y-2">
                  <h5 class="text-sm font-medium text-gray-700">Members:</h5>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="member in group.members"
                      :key="member.id"
                      class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {{ member.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Animated Invite Form (replaces group content) -->
              <div
                v-if="studyGroupsStore.canManageGroup(group.id) && showInviteForm[group.id]"
                class="transition-all duration-300 ease-in-out"
              >
                <div class="flex items-center justify-between mb-3">
                  <h6 class="text-sm font-medium text-gray-700">
                    Invite Users to {{ group.name }}
                  </h6>
                  <button
                    @click="toggleInviteForm(group.id)"
                    class="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Back
                  </button>
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Search Users</label>
                    <input
                      :value="inviteFormData[group.id]?.searchQuery || ''"
                      @input="
                        inviteFormData[group.id] = {
                          ...inviteFormData[group.id],
                          searchQuery: $event.target.value,
                        }
                      "
                      type="text"
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Search by name or email..."
                    />
                  </div>

                  <!-- Search Results -->
                  <div
                    v-if="
                      inviteFormData[group.id]?.searchQuery &&
                      getSearchResultsForGroup(group.id).length > 0
                    "
                    class="space-y-2"
                  >
                    <label class="block text-xs font-medium text-gray-600">Search Results:</label>
                    <div class="space-y-1 max-h-32 overflow-y-auto">
                      <div
                        v-for="user in getSearchResultsForGroup(group.id)"
                        :key="user.id"
                        class="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                      >
                        <div class="flex items-center gap-2">
                          <div>
                            <p class="font-medium text-gray-900">{{ user.name }}</p>
                            <p class="text-gray-600">{{ user.email }}</p>
                          </div>
                        </div>
                        <button
                          v-if="!isUserSelected(group.id, user.id)"
                          @click="selectUserForGroup(group.id, user)"
                          class="bg-primary text-white px-2 py-1 rounded text-xs hover:bg-primary-dk transition-colors"
                        >
                          Select
                        </button>
                        <span v-else class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Selected
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Selected Users Display -->
                  <div v-if="inviteFormData[group.id]?.selectedUsers?.length > 0" class="space-y-2">
                    <label class="block text-xs font-medium text-gray-600">Selected Users:</label>
                    <div class="space-y-1 max-h-32 overflow-y-auto">
                      <div
                        v-for="user in inviteFormData[group.id].selectedUsers"
                        :key="user.id"
                        class="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
                      >
                        <div class="flex items-center gap-2">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                            <p class="text-xs text-gray-600">{{ user.email }}</p>
                          </div>
                        </div>
                        <button
                          @click="removeSelectedUser(group.id, user.id)"
                          class="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1"
                      >Message (Optional)</label
                    >
                    <textarea
                      :value="inviteFormData[group.id]?.message || ''"
                      @input="
                        inviteFormData[group.id] = {
                          ...inviteFormData[group.id],
                          message: $event.target.value,
                        }
                      "
                      rows="2"
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Add a personal message..."
                    ></textarea>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="sendInviteFromGroup(group.id)"
                      class="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary-dk transition-colors"
                    >
                      Send Invite
                    </button>
                    <button
                      @click="toggleInviteForm(group.id)"
                      class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <!-- Invited Users (only show if user can manage this group) -->
              <div
                v-if="
                  studyGroupsStore.canManageGroup(group.id) &&
                  getInvitedUsersForGroup(group.id).length > 0
                "
                class="mt-4 space-y-2"
              >
                <h5 class="text-sm font-medium text-gray-700">Pending Invitations:</h5>
                <div class="space-y-1">
                  <div
                    v-for="invitation in getInvitedUsersForGroup(group.id)"
                    :key="invitation.id"
                    class="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-md p-2"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-700">{{ invitation.toUser.name }}</span>
                    </div>
                    <button
                      @click="showCancelModal(invitation)"
                      class="text-red-500 hover:text-red-700 transition-colors"
                      title="Cancel invitation"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Invite Button (only show if user can manage this group) -->
              <div v-if="studyGroupsStore.canManageGroup(group.id)" class="mt-4 flex justify-end">
                <button
                  @click="toggleInviteForm(group.id)"
                  class="bg-primary text-white px-3 py-2 rounded-md text-sm hover:bg-primary-dk transition-colors"
                >
                  Invite Users
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Groups -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Groups I'm Part Of</h3>
          <div v-if="groupsIAmPartOf.length === 0" class="text-gray-500 text-center py-8">
            You're not part of any groups yet. Accept an invitation to join a group!
          </div>
          <div v-else class="grid gap-4 md:grid-cols-2 items-start">
            <div
              v-for="group in groupsIAmPartOf"
              :key="group.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <!-- Group Content (no invite form for groups you don't own) -->
              <div class="transition-all duration-300 ease-in-out">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900">{{ group.name }}</h4>
                    <p class="text-gray-600 text-sm">{{ group.description }}</p>
                  </div>
                  <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {{ group.members.length }} member{{ group.members.length !== 1 ? 's' : '' }}
                  </span>
                </div>

                <div class="space-y-2">
                  <h5 class="text-sm font-medium text-gray-700">Members:</h5>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="member in group.members"
                      :key="member.id"
                      class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {{ member.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Group Tab -->
      <div v-if="activeTab === 'create'" class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900">Create New Study Group</h3>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form @submit.prevent="createGroup" class="space-y-4">
            <div>
              <label for="groupName" class="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                id="groupName"
                v-model="newGroup.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label for="groupDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="groupDescription"
                v-model="newGroup.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Describe your study group"
              ></textarea>
            </div>
            <button
              type="submit"
              class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dk transition-colors"
            >
              Create Group
            </button>
          </form>
        </div>
      </div>

      <!-- Pending Invitations Tab -->
      <div v-if="activeTab === 'pending'" class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900">Pending Invitations</h3>
        <div v-if="pendingInvitations.length === 0" class="text-gray-500 text-center py-8">
          No pending invitations
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="invitation in pendingInvitations"
            :key="invitation.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-gray-900">{{ invitation.fromUser.name }}</h4>
                <p class="text-gray-600 text-sm">{{ invitation.fromUser.email }}</p>
                <p class="text-gray-700 mt-2">{{ invitation.message }}</p>
                <p class="text-xs text-gray-500 mt-2">Invited to: {{ invitation.groupName }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="acceptInvitation(invitation.id)"
                  class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  @click="rejectInvitation(invitation.id)"
                  class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="showModal"
      :title="modalTitle"
      :message="modalMessage"
      :confirm-text="modalConfirmText"
      @close="handleModalClose"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStudyGroupsStore } from '@/stores/studyGroupsStore'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const studyGroupsStore = useStudyGroupsStore()

// Reactive data
const activeTab = ref('groups')
const searchQuery = ref('')
const selectedGroupId = ref('')
const newGroup = ref({
  name: '',
  description: '',
})
const showCreateForm = ref(false)
const showInviteForm = ref({}) // Track which group is showing invite form
const inviteFormData = ref({}) // Store invite form data per group

// Modal state
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('')
const pendingAction = ref(null)

// Computed properties
const studyGroups = computed(() => studyGroupsStore.studyGroups)
const pendingInvitations = computed(() => studyGroupsStore.pendingInvitations)
const sentInvitations = computed(() => studyGroupsStore.sentInvitations)
const allUsers = computed(() => studyGroupsStore.allUsers)
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  return studyGroupsStore.searchUsers(searchQuery.value)
})

// Separate groups by ownership
const groupsIOwn = computed(() => {
  return studyGroups.value.filter((group) => studyGroupsStore.canManageGroup(group.id))
})

const groupsIAmPartOf = computed(() => {
  return studyGroups.value.filter((group) => !studyGroupsStore.canManageGroup(group.id))
})

// Get invited users for each group
const getInvitedUsersForGroup = (groupId) => {
  return sentInvitations.value.filter((invitation) => invitation.groupId === groupId)
}

// Tabs configuration
const tabs = [
  { id: 'groups', name: 'Groups' },
  { id: 'create', name: 'Create Group' },
  { id: 'pending', name: 'Pending Invitations' },
]

// Methods
const createGroup = () => {
  if (newGroup.value.name.trim()) {
    studyGroupsStore.createStudyGroup(newGroup.value.name, newGroup.value.description)
    newGroup.value = { name: '', description: '' }
    showCreateForm.value = false // Hide form after creation
    activeTab.value = 'groups' // Switch back to My Groups tab
  }
}

const toggleInviteForm = (groupId) => {
  // Initialize form data if it doesn't exist
  if (!inviteFormData.value[groupId]) {
    inviteFormData.value[groupId] = { searchQuery: '', selectedUsers: [], message: '' }
  }

  showInviteForm.value[groupId] = !showInviteForm.value[groupId]
  if (!showInviteForm.value[groupId]) {
    // Clear form data when hiding
    inviteFormData.value[groupId] = { searchQuery: '', selectedUsers: [], message: '' }
  }
}

const getSearchResultsForGroup = (groupId) => {
  const formData = inviteFormData.value[groupId]
  if (!formData?.searchQuery?.trim()) return []

  return allUsers.value.filter(
    (user) =>
      user.name.toLowerCase().includes(formData.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(formData.searchQuery.toLowerCase()),
  )
}

const selectUserForGroup = (groupId, user) => {
  const formData = inviteFormData.value[groupId]
  // Check if user is already selected
  const isAlreadySelected = formData.selectedUsers.some((selected) => selected.id === user.id)

  if (!isAlreadySelected) {
    inviteFormData.value[groupId] = {
      ...formData,
      selectedUsers: [...formData.selectedUsers, user],
      searchQuery: '', // Clear search after selection
    }
  }
}

const removeSelectedUser = (groupId, userId) => {
  inviteFormData.value[groupId] = {
    ...inviteFormData.value[groupId],
    selectedUsers: inviteFormData.value[groupId].selectedUsers.filter((user) => user.id !== userId),
  }
}

const isUserSelected = (groupId, userId) => {
  const formData = inviteFormData.value[groupId]
  return formData?.selectedUsers?.some((user) => user.id === userId) || false
}

const sendInviteFromGroup = (groupId) => {
  const formData = inviteFormData.value[groupId]
  if (!formData || !formData.selectedUsers || formData.selectedUsers.length === 0) {
    showModal.value = true
    modalTitle.value = 'No Users Selected'
    modalMessage.value = 'Please search and select at least one user to invite.'
    modalConfirmText.value = 'OK'
    pendingAction.value = null
    return
  }

  try {
    const groupName = studyGroups.value.find((g) => g.id === groupId)?.name
    const message = formData.message || `Join our ${groupName} study group!`

    // Send invitations to all selected users
    formData.selectedUsers.forEach((user) => {
      studyGroupsStore.sendInvitation(user.email, groupId, message)
    })

    // Reset form and hide
    inviteFormData.value[groupId] = { searchQuery: '', selectedUsers: [], message: '' }
    showInviteForm.value[groupId] = false

    showModal.value = true
    modalTitle.value = 'Invitations Sent'
    modalMessage.value = `Invitations sent to ${formData.selectedUsers.length} user${formData.selectedUsers.length > 1 ? 's' : ''}`
    modalConfirmText.value = 'OK'
    pendingAction.value = null
  } catch (error) {
    showModal.value = true
    modalTitle.value = 'Error'
    modalMessage.value = error.message
    modalConfirmText.value = 'OK'
    pendingAction.value = null
  }
}

const sendInviteToUser = (user) => {
  if (!selectedGroupId.value) {
    showModal.value = true
    modalTitle.value = 'No Group Selected'
    modalMessage.value = 'Please select a study group first before sending invitations.'
    modalConfirmText.value = 'OK'
    pendingAction.value = null
    return
  }

  // Check if user can manage this group
  if (!studyGroupsStore.canManageGroup(selectedGroupId.value)) {
    showModal.value = true
    modalTitle.value = 'Permission Denied'
    modalMessage.value = 'Only group owners can send invitations.'
    modalConfirmText.value = 'OK'
    pendingAction.value = null
    return
  }

  const selectedGroup = studyGroups.value.find((g) => g.id === selectedGroupId.value)
  if (selectedGroup) {
    try {
      // Actually create the invitation
      studyGroupsStore.sendInvitation(
        user.email,
        selectedGroupId.value,
        `Join our ${selectedGroup.name} study group!`,
      )

      // Show confirmation
      showModal.value = true
      modalTitle.value = 'Invitation Sent'
      modalMessage.value = `Invitation sent to ${user.name} (${user.email}) for ${selectedGroup.name}`
      modalConfirmText.value = 'OK'
      pendingAction.value = null
    } catch (error) {
      showModal.value = true
      modalTitle.value = 'Error'
      modalMessage.value = error.message
      modalConfirmText.value = 'OK'
      pendingAction.value = null
    }
  }
}

const acceptInvitation = (invitationId) => {
  studyGroupsStore.acceptInvitation(invitationId)
}

const rejectInvitation = (invitationId) => {
  studyGroupsStore.rejectInvitation(invitationId)
}

const cancelSentInvitation = (invitationId) => {
  const invitation = sentInvitations.value.find((inv) => inv.id === invitationId)
  if (invitation) {
    // Check if user can manage this group
    if (!studyGroupsStore.canManageGroup(invitation.groupId)) {
      showModal.value = true
      modalTitle.value = 'Permission Denied'
      modalMessage.value = 'Only group owners can cancel invitations.'
      modalConfirmText.value = 'OK'
      pendingAction.value = null
      return
    }

    showModal.value = true
    modalTitle.value = 'Cancel Invitation'
    modalMessage.value = `Are you sure you want to cancel the invitation to ${invitation.toUser.name}?`
    modalConfirmText.value = 'Cancel Invitation'
    pendingAction.value = () => {
      try {
        studyGroupsStore.cancelSentInvitation(invitationId)
      } catch (error) {
        showModal.value = true
        modalTitle.value = 'Error'
        modalMessage.value = error.message
        modalConfirmText.value = 'OK'
        pendingAction.value = null
      }
    }
  }
}

const showCancelModal = (invitation) => {
  showModal.value = true
  modalTitle.value = 'Cancel Invitation'
  modalMessage.value = `Are you sure you want to cancel the invitation to ${invitation.toUser.name}?`
  modalConfirmText.value = 'Cancel Invitation'
  pendingAction.value = () => studyGroupsStore.cancelSentInvitation(invitation.id)
}

const handleModalConfirm = () => {
  if (pendingAction.value) {
    pendingAction.value()
  }
  showModal.value = false
  pendingAction.value = null
}

const handleModalClose = () => {
  showModal.value = false
  pendingAction.value = null
}

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    // Search is handled by computed property
  }
})
</script>
