<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ChapterViewer from '@/components/ChapterViewer.vue'
import { useBibleStore } from '@/stores/bibleStore'
import { useStudyGroupsStore } from '@/stores/studyGroupsStore'
import * as HeroIcons from '@heroicons/vue/24/solid'
// use uuidv4
import { v4 as uuidv4 } from 'uuid'
import SideNav from '@/components/SideNav.vue'
import BibleReader from '@/components/BibleReader.vue'
import BibleSidebar from '@/components/BibleSidebar.vue'

const bibleStore = useBibleStore()
const studyGroupsStore = useStudyGroupsStore()
const router = useRouter()

const bookData = computed(() => bibleStore.bookData)
const chapterData = computed(() => bibleStore.chapterData)
const versesData = computed(() => bibleStore.versesData)
const compiledData = computed(() => bibleStore.compiledData)
const activeChapter = computed(() => bibleStore.activeChapter)
const currentBookId = computed(() => bibleStore.currentBookId)
const currentVersion = computed(() => bibleStore.currentVersion)
const activeVerse = computed(() => bibleStore.activeVerse)
const activeNote = computed(() => bibleStore.activeNote)
const activeQuestions = computed(() => bibleStore.activeQuestions)
const userNotes = computed(() => bibleStore.userNotes)
const userQuestions = computed(() => bibleStore.userQuestions)

// Book summary
const bookSummary = computed(() => {
	if (currentBookId.value) {
		return bibleStore.getBookSummary(currentBookId.value)
	}
	return null
})

const isLoading = computed(() => bibleStore.isLoading)

// Verse comparison functionality
const comparisonData = ref(null)
const isComparisonLoading = ref(false)
const comparisonError = ref(null)
const showComparison = ref(false)
const selectedComparisonVersion = ref('')
const versionSearchQuery = ref('')
const showVersionDropdown = ref(false)
const versionDropdownContainer = ref(null)

// Comparison modal notes/questions
const comparisonNote = ref('')
const comparisonQuestion = ref('')
const comparisonActiveTab = ref('notes')

// Mobile tab layout: 'nav' | 'bible' | 'sidebar' (default Bible so middle section shows first)
const mobileTab = ref('bible')
// Match Tailwind md breakpoint (1100px): on desktop both center panels show; on mobile only the active tab
const isDesktop = ref(false)

// Switch mobile tab and move focus to the tab button so focus is never inside an aria-hidden panel (a11y)
const setMobileTab = (tab, event) => {
	mobileTab.value = tab
	nextTick(() => {
		event?.currentTarget?.focus?.()
	})
}

// Watch for book changes to reset active verse
watch(currentBookId, (newBookId, oldBookId) => {
	if (newBookId !== oldBookId) {
		bibleStore.setActiveVerse(null)
	}
})

const setActiveVerse = (verse) => {
	if (activeVerse.value?.id === verse.id) {
		bibleStore.setActiveVerse(null)
		return
	}

	bibleStore.setActiveVerse(verse)
}

const findActiveVerse = (note) => {
	console.log('🔍 findActiveVerse called with:', note)
	bibleStore.navigateToVerseFromNote(note)

	// Scroll to the verse after navigation
	setTimeout(() => {
		const verseElement = document.querySelector(`[data-verse-id="${note.id}"]`)
		if (verseElement) {
			verseElement.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			})
		}
	}, 100)
}

const findActiveVerseFromQuestion = (question) => {
	console.log('🔍 findActiveVerseFromQuestion called with:', question)
	bibleStore.navigateToVerseFromNote(question)

	// Scroll to the verse after navigation
	setTimeout(() => {
		const verseElement = document.querySelector(`[data-verse-id="${question.id}"]`)
		if (verseElement) {
			verseElement.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			})
		}
	}, 100)
}

// Navigate to a specific verse
const navigateToVerse = (verse) => {
	// Find the chapter in compiled data
	const chapter = compiledData.value?.find((c) => c.number === verse.chapterNumber)
	if (chapter) {
		bibleStore.setActiveChapter(chapter)
		// Find and set the specific verse
		const targetVerse = chapter.verses.find((v) => v.verse === verse.verse)
		if (targetVerse) {
			setActiveVerse(targetVerse)
			// Scroll to the verse after a short delay to ensure DOM is updated
			nextTick(() => {
				setTimeout(() => {
					scrollToVerse(targetVerse.id)
				}, 100)
			})
		}
	}
}

// Scroll to a specific verse
const scrollToVerse = (verseId) => {
	const verseElement = document.querySelector(`[data-verse-id="${verseId}"]`)
	if (verseElement) {
		verseElement.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		})
	}
}

// Verse comparison functions
const openComparison = async (verse, targetVersionId) => {
	try {
		isComparisonLoading.value = true
		comparisonError.value = null

		const comparison = await bibleStore.loadVerseComparison(verse, targetVersionId)
		comparisonData.value = comparison
		selectedComparisonVersion.value = targetVersionId
		showComparison.value = true
	} catch (error) {
		comparisonError.value = error.message
		console.error('Error loading verse comparison:', error)
	} finally {
		isComparisonLoading.value = false
	}
}

const closeComparison = () => {
	showComparison.value = false
	comparisonData.value = null
	comparisonError.value = null
	selectedComparisonVersion.value = ''
	versionSearchQuery.value = ''
	showVersionDropdown.value = false
	comparisonNote.value = ''
	comparisonQuestion.value = ''
	comparisonActiveTab.value = 'notes'
}

// Switch comparison version
const switchComparisonVersion = async (versionId) => {
	if (!comparisonData.value) return

	try {
		isComparisonLoading.value = true
		comparisonError.value = null

		const newComparison = await bibleStore.loadVerseComparison(
			comparisonData.value.originalVerse,
			versionId,
		)
		comparisonData.value = newComparison
		selectedComparisonVersion.value = versionId
	} catch (error) {
		comparisonError.value = error.message
		console.error('Error switching comparison version:', error)
	} finally {
		isComparisonLoading.value = false
	}
}

// Select version and close dropdown
const selectVersion = async (versionId) => {
	await switchComparisonVersion(versionId)
	showVersionDropdown.value = false
}

// Handle click outside dropdown
const handleClickOutside = (event) => {
	if (versionDropdownContainer.value && !versionDropdownContainer.value.contains(event.target)) {
		showVersionDropdown.value = false
	}
}

// Handle modal click - close modal unless clicking on dropdown
const handleModalClick = (event) => {
	// Don't close if clicking on the dropdown container
	if (versionDropdownContainer.value && versionDropdownContainer.value.contains(event.target)) {
		return
	}
	// Close the modal
	closeComparison()
}

// Close dropdown if clicking outside of it
const closeDropdownIfOpen = (event) => {
	if (
		showVersionDropdown.value &&
		versionDropdownContainer.value &&
		!versionDropdownContainer.value.contains(event.target)
	) {
		showVersionDropdown.value = false
	}
}

// Get notes/questions for the comparison verse
const getComparisonVerseNote = () => {
	if (!comparisonData.value) return null
	const verse = comparisonData.value.originalVerse
	const noteKey = `${verse.book}_${verse.chapter}_${verse.verse}`
	return bibleStore.userNotes[noteKey] || null
}

const getComparisonVerseQuestion = () => {
	if (!comparisonData.value) return null
	const verse = comparisonData.value.originalVerse
	const noteKey = `${verse.book}_${verse.chapter}_${verse.verse}`
	return bibleStore.userQuestions[noteKey] || null
}

// Save comparison note
const saveComparisonNote = () => {
	if (!comparisonData.value) return
	const verse = comparisonData.value.originalVerse
	const noteKey = `${verse.book}_${verse.chapter}_${verse.verse}`

	if (comparisonNote.value.trim()) {
		bibleStore.addOrUpdateNote(verse, comparisonNote.value, bibleStore.userNotes[noteKey]?.id)
	}
}

// Save comparison question
const saveComparisonQuestion = () => {
	if (!comparisonData.value) return
	const verse = comparisonData.value.originalVerse
	const noteKey = `${verse.book}_${verse.chapter}_${verse.verse}`

	if (comparisonQuestion.value.trim()) {
		bibleStore.addOrUpdateQuestion(
			verse,
			comparisonQuestion.value,
			bibleStore.userQuestions[noteKey]?.id,
		)
	}
}

// Top 5 most common Bible versions
const popularVersions = computed(() => {
	const popularIds = ['kjv', 'niv', 'esv', 'nasb', 'nlt']
	return bibleStore.getAvailableVersions().filter((version) => popularIds.includes(version.id))
})

// Other versions (excluding popular ones)
const otherVersions = computed(() => {
	const popularIds = ['kjv', 'niv', 'esv', 'nasb', 'nlt']
	return bibleStore.getAvailableVersions().filter((version) => !popularIds.includes(version.id))
})

// Filtered versions for comparison (other versions only)
const filteredComparisonVersions = computed(() => {
	if (!versionSearchQuery.value) return otherVersions.value

	return otherVersions.value.filter(
		(version) =>
			version.name.toLowerCase().includes(versionSearchQuery.value.toLowerCase()) ||
			version.abbreviation.toLowerCase().includes(versionSearchQuery.value.toLowerCase()),
	)
})

onMounted(async () => {
	isDesktop.value = window.matchMedia('(min-width: 1100px)').matches
	window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => {
		isDesktop.value = e.matches
	})
	if (!bookData.value) {
		await bibleStore.setBookData({ id: 'genesis' })
	}
})

// Watch for comparison data changes to load notes/questions
watch(comparisonData, () => {
	if (comparisonData.value) {
		const existingNote = getComparisonVerseNote()
		const existingQuestion = getComparisonVerseQuestion()
		comparisonNote.value = existingNote?.text || ''
		comparisonQuestion.value = existingQuestion?.text || ''
	}
})
</script>

<template>
	<div
		class="flex flex-col md:flex-row gap-4 pt-20 px-4 pb-16 md:pb-2 h-[calc(100vh)] overflow-hidden"
	>
		<!-- SideNav: on mobile visible only when mobileTab === 'nav' and fills screen; on desktop always visible -->
		<div
			role="tabpanel"
			:aria-hidden="mobileTab !== 'nav'"
			:class="{ hidden: mobileTab !== 'nav' }"
			class="flex-1 min-h-0 h-full overflow-auto md:!block md:flex-none md:w-80 md:h-auto md:min-h-0 md:overflow-visible"
		>
			<SideNav />
		</div>
		<!-- Main: on mobile visible when bible or sidebar tab; on desktop always visible, same as original -->
		<div
			role="tabpanel"
			:aria-hidden="mobileTab === 'nav'"
			:class="{ hidden: mobileTab === 'nav' }"
			class="w-full md:w-fit mx-auto flex flex-col gap-4 max-w-[1400px] h-full min-h-0 flex-1 overflow-hidden md:!flex"
		>
			<!-- Loading indicator -->
			<div v-if="isLoading" class="w-full bg-white/60 rounded-xl shadow-lg p-8 text-center">
				<div class="flex items-center justify-center gap-2">
					<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
					<span class="text-sm text-gray-600">Loading Bible data...</span>
				</div>
			</div>
			<div class="flex grow gap-4 min-h-0 flex-1 h-full">
				<!-- BibleReader: dominant on desktop (flex-[3]); on mobile visible only when mobileTab === 'bible', fills screen -->
				<div
					v-show="mobileTab === 'bible' || isDesktop"
					role="tabpanel"
					:aria-hidden="mobileTab !== 'bible' && !isDesktop"
					class="flex-1 min-h-0 h-full w-full overflow-auto md:flex-[3] md:min-w-0 md:overflow-hidden"
				>
					<BibleReader :openComparison="openComparison" />
				</div>
				<!-- BibleSidebar: on desktop same as before (flex-[1]); on mobile visible only when mobileTab === 'sidebar', fills screen -->
				<div
					v-show="mobileTab === 'sidebar' || isDesktop"
					role="tabpanel"
					:aria-hidden="mobileTab !== 'sidebar' && !isDesktop"
					class="flex-1 min-h-0 min-w-[300px] h-full w-full overflow-auto md:flex-[1] md:flex-shrink-0 md:overflow-hidden"
				>
					<BibleSidebar />
				</div>
			</div>
		</div>

		<!-- Mobile bottom tab bar: fixed, only visible below md -->
		<nav
			role="tablist"
			class="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around bg-white border-t border-neutral-20 pb-[env(safe-area-inset-bottom)] pt-3 px-2"
			aria-label="Bible view sections"
		>
			<button
				role="tab"
				type="button"
				:aria-selected="mobileTab === 'nav'"
				:class="
					mobileTab === 'nav'
						? 'bg-secondary text-neutral-90'
						: 'text-neutral-60 hover:bg-neutral-10'
				"
				class="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors"
				@click="setMobileTab('nav', $event)"
			>
				<HeroIcons.Bars3Icon class="w-6 h-6" aria-hidden="true" />
				<span class="text-xs font-medium">Nav</span>
			</button>
			<button
				role="tab"
				type="button"
				:aria-selected="mobileTab === 'bible'"
				:class="
					mobileTab === 'bible'
						? 'bg-secondary text-neutral-90'
						: 'text-neutral-60 hover:bg-neutral-10'
				"
				class="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors"
				@click="setMobileTab('bible', $event)"
			>
				<HeroIcons.BookOpenIcon class="w-6 h-6" aria-hidden="true" />
				<span class="text-xs font-medium">Bible</span>
			</button>
			<button
				role="tab"
				type="button"
				:aria-selected="mobileTab === 'sidebar'"
				:class="
					mobileTab === 'sidebar'
						? 'bg-secondary text-neutral-90'
						: 'text-neutral-60 hover:bg-neutral-10'
				"
				class="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors"
				@click="setMobileTab('sidebar', $event)"
			>
				<HeroIcons.ClipboardDocumentListIcon class="w-6 h-6" aria-hidden="true" />
				<span class="text-xs font-medium">Notes</span>
			</button>
		</nav>

		<!-- Verse Comparison Modal -->
		<div
			v-if="showComparison"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
			@click="handleModalClick"
		>
			<div
				class="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
				@click.stop
			>
				<!-- Modal Header -->
				<div class="flex items-center justify-between p-6 border-b border-neutral-20">
					<h3 class="text-lg font-semibold text-neutral-90">Verse Comparison</h3>
					<button
						@click="closeComparison"
						class="text-neutral-60 hover:text-neutral-80 transition-colors"
					>
						<HeroIcons.XMarkIcon class="w-6 h-6" />
					</button>
				</div>

				<!-- Modal Content -->
				<div class="flex-1 overflow-y-auto p-6" @click="closeDropdownIfOpen">
					<div v-if="isComparisonLoading" class="flex items-center justify-center py-8">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						<span class="ml-3 text-neutral-60">Loading comparison...</span>
					</div>

					<div v-else-if="comparisonError" class="text-center py-8">
						<div class="text-red-600 mb-4">
							<HeroIcons.ExclamationTriangleIcon class="w-12 h-12 mx-auto mb-2" />
							<p class="font-medium">Error loading comparison</p>
						</div>
						<p class="text-neutral-60 mb-4">{{ comparisonError }}</p>
						<button
							@click="closeComparison"
							class="px-4 py-2 bg-neutral-50 text-neutral-80 rounded-md hover:bg-neutral-30 transition-colors"
						>
							Close
						</button>
					</div>

					<div v-else-if="comparisonData" class="space-y-6">
						<!-- Verse Comparison Cards -->
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-neutral-30 p-4 rounded-lg">
							<!-- Original Verse -->
							<div class="bg-neutral-10 p-4 rounded-lg border border-neutral-20">
								<h4 class="font-medium text-neutral-90 mb-2">
									{{ comparisonData.originalVerse.book }}
									{{ comparisonData.originalVerse.chapter }}:{{
										comparisonData.originalVerse.verse
									}}
									(Current Version)
								</h4>
								<p class="text-neutral-70">{{ comparisonData.originalVerse.text }}</p>
							</div>

							<!-- Comparison Verse -->
							<div class="bg-primary-10 p-4 rounded-lg border border-primary-20">
								<h4 class="font-medium text-neutral-90 mb-2">
									{{ comparisonData.originalVerse.book }}
									{{ comparisonData.originalVerse.chapter }}:{{
										comparisonData.originalVerse.verse
									}}
									({{ comparisonData.version?.name || 'NIV' }})
								</h4>
								<p class="text-neutral-70">{{ comparisonData.text }}</p>
							</div>
						</div>

						<!-- Version Selection -->
						<div class="space-y-4">
							<h4 class="font-medium text-neutral-90">Compare with:</h4>

							<!-- Popular Versions Buttons -->
							<div class="flex flex-wrap gap-2">
								<button
									v-for="version in popularVersions"
									:key="version.id"
									@click="switchComparisonVersion(version.id)"
									class="px-3 py-2 text-sm rounded-md transition-colors"
									:class="{
										'bg-secondary': selectedComparisonVersion === version.id,
										'bg-neutral-20 text-neutral-70 hover:bg-neutral-30':
											selectedComparisonVersion !== version.id,
									}"
								>
									{{ version.abbreviation }}
								</button>
							</div>

							<!-- Other Versions Dropdown -->
							<div class="relative" ref="versionDropdownContainer" @click.stop>
								<label class="block text-sm font-medium text-neutral-70 mb-2"
									>Other Versions:</label
								>
								<div class="relative">
									<input
										v-model="versionSearchQuery"
										type="text"
										placeholder="Search versions..."
										class="w-full p-3 border border-neutral-30 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
										@focus="showVersionDropdown = true"
										@keydown.escape="showVersionDropdown = false"
										@keydown.enter="showVersionDropdown = false"
									/>
									<div class="absolute inset-y-0 right-0 flex items-center pr-3">
										<HeroIcons.MagnifyingGlassIcon class="w-4 h-4 text-neutral-50" />
									</div>
								</div>

								<!-- Dropdown List -->
								<div
									v-if="filteredComparisonVersions.length > 0 && showVersionDropdown"
									class="absolute z-[100] w-full mt-1 bg-white border border-neutral-30 rounded-md shadow-xl max-h-60 overflow-y-auto"
								>
									<button
										v-for="version in filteredComparisonVersions"
										:key="version.id"
										@click="selectVersion(version.id)"
										class="w-full text-left px-4 py-2 text-sm hover:bg-neutral-10 transition-colors"
										:class="{
											'bg-secondary-lt': selectedComparisonVersion === version.id,
										}"
									>
										<div class="font-medium text-neutral-90">{{ version.name }}</div>
										<div class="text-xs text-neutral-60">{{ version.abbreviation }}</div>
									</button>
								</div>
							</div>
						</div>

						<!-- Notes and Questions Section -->
						<div class="border-t border-neutral-20 pt-6">
							<h4 class="font-medium text-neutral-90 mb-4">Notes & Questions for this Verse</h4>

							<!-- Notes Tab -->
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-neutral-70 mb-2">Note</label>
									<textarea
										v-model="comparisonNote"
										class="w-full p-3 border border-neutral-30 rounded-md resize-none focus:border-primary focus:ring-1 focus:ring-primary"
										rows="3"
										placeholder="Add a note about this verse comparison..."
									></textarea>
									<div class="flex gap-2 mt-2">
										<button
											@click="saveComparisonNote"
											:disabled="!comparisonNote.trim()"
											class="px-4 py-2 bg-secondary rounded-md hover:bg-secondary-dk disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											Save Note
										</button>
										<button
											@click="comparisonNote = ''"
											class="px-4 py-2 bg-neutral-30 text-neutral-70 rounded-md hover:bg-neutral-40 transition-colors"
										>
											Clear
										</button>
									</div>
								</div>

								<div>
									<label class="block text-sm font-medium text-neutral-70 mb-2">Question</label>
									<textarea
										v-model="comparisonQuestion"
										class="w-full p-3 border border-neutral-30 rounded-md resize-none focus:border-primary focus:ring-1 focus:ring-primary"
										rows="3"
										placeholder="Add a question about this verse comparison..."
									></textarea>
									<div class="flex gap-2 mt-2">
										<button
											@click="saveComparisonQuestion"
											:disabled="!comparisonQuestion.trim()"
											class="px-4 py-2 bg-secondary rounded-md hover:bg-secondary-dk disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											Save Question
										</button>
										<button
											@click="comparisonQuestion = ''"
											class="px-4 py-2 bg-neutral-30 text-neutral-70 rounded-md hover:bg-neutral-40 transition-colors"
										>
											Clear
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Jesus speech highlighting */
.jesus-speaking {
	border-left: 4px solid #e74c3c;
	background-color: #fdf2f2;
}

.jesus-text {
	font-style: italic;
	color: #c0392b;
	font-weight: 500;
}

/* God speech highlighting */
.god-speaking {
	border-left: 4px solid #8e44ad;
	background-color: #f4f0f7;
}

.god-text {
	font-style: italic;
	color: #8e44ad;
	font-weight: 500;
}

/* Key person highlighting */
.person-highlighted {
	border-left: 4px solid #f39c12;
	background-color: #fef9e7;
	box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
}

.verse-number {
	font-weight: bold;
	margin-right: 8px;
	@apply text-secondary-dk;
}

.verse-text {
	line-height: 1.4;
}

/* Enhanced styling for better readability */
li {
	transition: all 0.2s ease;
	border-radius: 6px;
}

li:hover {
	transform: translateY(-1px);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Active verse styling */
li.bg-secondary {
	background-color: #3498db !important;
	color: white;
}

li.bg-secondary .verse-number {
	color: white;
}

li.bg-secondary .jesus-text {
	color: #ffeb3b;
	font-weight: 600;
}

li.bg-secondary .god-text {
	color: #ffeb3b;
	font-weight: 600;
}

/* Textarea word wrapping */
textarea {
	word-wrap: break-word;
	overflow-wrap: break-word;
	white-space: pre-wrap;
	max-width: 100%;
	box-sizing: border-box;
}

/* Chapter carousel transitions */
.chapter-slide-enter-active,
.chapter-slide-leave-active {
	transition: all 0.2s ease-in-out;
}

.chapter-slide-enter-from {
	opacity: 0;
	transform: translateX(10px);
}

.chapter-slide-leave-to {
	opacity: 0;
	transform: translateX(-10px);
}

.chapter-slide-move {
	transition: transform 0.2s ease-in-out;
}
</style>
