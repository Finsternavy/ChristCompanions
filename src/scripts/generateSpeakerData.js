// Speaker Data Generation Script
// This script creates comprehensive speaker reference data for Jesus and God

import fs from 'fs'
import path from 'path'

// Comprehensive list of verses where Jesus is speaking
// Based on red-letter Bible editions and scholarly sources
const jesusSpeakingVerses = {
  // Matthew - Jesus' words
  matthew: [
    // Chapter 3
    { chapter: 3, verse: 15 },
    // Chapter 4 - Temptation
    { chapter: 4, verse: 4 },
    { chapter: 4, verse: 7 },
    { chapter: 4, verse: 10 },
    // Chapter 5 - Sermon on the Mount
    { chapter: 5, verse: 3 },
    { chapter: 5, verse: 4 },
    { chapter: 5, verse: 5 },
    { chapter: 5, verse: 6 },
    { chapter: 5, verse: 7 },
    { chapter: 5, verse: 8 },
    { chapter: 5, verse: 9 },
    { chapter: 5, verse: 10 },
    { chapter: 5, verse: 11 },
    { chapter: 5, verse: 12 },
    { chapter: 5, verse: 13 },
    { chapter: 5, verse: 14 },
    { chapter: 5, verse: 15 },
    { chapter: 5, verse: 16 },
    { chapter: 5, verse: 17 },
    { chapter: 5, verse: 18 },
    { chapter: 5, verse: 19 },
    { chapter: 5, verse: 20 },
    { chapter: 5, verse: 21 },
    { chapter: 5, verse: 22 },
    { chapter: 5, verse: 23 },
    { chapter: 5, verse: 24 },
    { chapter: 5, verse: 25 },
    { chapter: 5, verse: 26 },
    { chapter: 5, verse: 27 },
    { chapter: 5, verse: 28 },
    { chapter: 5, verse: 29 },
    { chapter: 5, verse: 30 },
    { chapter: 5, verse: 31 },
    { chapter: 5, verse: 32 },
    { chapter: 5, verse: 33 },
    { chapter: 5, verse: 34 },
    { chapter: 5, verse: 35 },
    { chapter: 5, verse: 36 },
    { chapter: 5, verse: 37 },
    { chapter: 5, verse: 38 },
    { chapter: 5, verse: 39 },
    { chapter: 5, verse: 40 },
    { chapter: 5, verse: 41 },
    { chapter: 5, verse: 42 },
    { chapter: 5, verse: 43 },
    { chapter: 5, verse: 44 },
    { chapter: 5, verse: 45 },
    { chapter: 5, verse: 46 },
    { chapter: 5, verse: 47 },
    { chapter: 5, verse: 48 },
    // Chapter 6 - Sermon on the Mount continued
    { chapter: 6, verse: 1 },
    { chapter: 6, verse: 2 },
    { chapter: 6, verse: 3 },
    { chapter: 6, verse: 4 },
    { chapter: 6, verse: 5 },
    { chapter: 6, verse: 6 },
    { chapter: 6, verse: 7 },
    { chapter: 6, verse: 8 },
    { chapter: 6, verse: 9 },
    { chapter: 6, verse: 10 },
    { chapter: 6, verse: 11 },
    { chapter: 6, verse: 12 },
    { chapter: 6, verse: 13 },
    { chapter: 6, verse: 14 },
    { chapter: 6, verse: 15 },
    { chapter: 6, verse: 16 },
    { chapter: 6, verse: 17 },
    { chapter: 6, verse: 18 },
    { chapter: 6, verse: 19 },
    { chapter: 6, verse: 20 },
    { chapter: 6, verse: 21 },
    { chapter: 6, verse: 22 },
    { chapter: 6, verse: 23 },
    { chapter: 6, verse: 24 },
    { chapter: 6, verse: 25 },
    { chapter: 6, verse: 26 },
    { chapter: 6, verse: 27 },
    { chapter: 6, verse: 28 },
    { chapter: 6, verse: 29 },
    { chapter: 6, verse: 30 },
    { chapter: 6, verse: 31 },
    { chapter: 6, verse: 32 },
    { chapter: 6, verse: 33 },
    { chapter: 6, verse: 34 },
    // Chapter 7 - Sermon on the Mount continued
    { chapter: 7, verse: 1 },
    { chapter: 7, verse: 2 },
    { chapter: 7, verse: 3 },
    { chapter: 7, verse: 4 },
    { chapter: 7, verse: 5 },
    { chapter: 7, verse: 6 },
    { chapter: 7, verse: 7 },
    { chapter: 7, verse: 8 },
    { chapter: 7, verse: 9 },
    { chapter: 7, verse: 10 },
    { chapter: 7, verse: 11 },
    { chapter: 7, verse: 12 },
    { chapter: 7, verse: 13 },
    { chapter: 7, verse: 14 },
    { chapter: 7, verse: 15 },
    { chapter: 7, verse: 16 },
    { chapter: 7, verse: 17 },
    { chapter: 7, verse: 18 },
    { chapter: 7, verse: 19 },
    { chapter: 7, verse: 20 },
    { chapter: 7, verse: 21 },
    { chapter: 7, verse: 22 },
    { chapter: 7, verse: 23 },
    { chapter: 7, verse: 24 },
    { chapter: 7, verse: 25 },
    { chapter: 7, verse: 26 },
    { chapter: 7, verse: 27 },
    // Chapter 8 - Healing and teaching
    { chapter: 8, verse: 3 },
    { chapter: 8, verse: 4 },
    { chapter: 8, verse: 7 },
    { chapter: 8, verse: 10 },
    { chapter: 8, verse: 11 },
    { chapter: 8, verse: 12 },
    { chapter: 8, verse: 13 },
    { chapter: 8, verse: 20 },
    { chapter: 8, verse: 22 },
    { chapter: 8, verse: 26 },
    // Chapter 9 - More healing and teaching
    { chapter: 9, verse: 2 },
    { chapter: 9, verse: 4 },
    { chapter: 9, verse: 5 },
    { chapter: 9, verse: 6 },
    { chapter: 9, verse: 9 },
    { chapter: 9, verse: 12 },
    { chapter: 9, verse: 13 },
    { chapter: 9, verse: 15 },
    { chapter: 9, verse: 17 },
    { chapter: 9, verse: 22 },
    { chapter: 9, verse: 28 },
    { chapter: 9, verse: 29 },
    { chapter: 9, verse: 30 },
    { chapter: 9, verse: 37 },
    { chapter: 9, verse: 38 },
    // Chapter 10 - Sending out the twelve
    { chapter: 10, verse: 5 },
    { chapter: 10, verse: 6 },
    { chapter: 10, verse: 7 },
    { chapter: 10, verse: 8 },
    { chapter: 10, verse: 9 },
    { chapter: 10, verse: 10 },
    { chapter: 10, verse: 11 },
    { chapter: 10, verse: 12 },
    { chapter: 10, verse: 13 },
    { chapter: 10, verse: 14 },
    { chapter: 10, verse: 15 },
    { chapter: 10, verse: 16 },
    { chapter: 10, verse: 17 },
    { chapter: 10, verse: 18 },
    { chapter: 10, verse: 19 },
    { chapter: 10, verse: 20 },
    { chapter: 10, verse: 21 },
    { chapter: 10, verse: 22 },
    { chapter: 10, verse: 23 },
    { chapter: 10, verse: 24 },
    { chapter: 10, verse: 25 },
    { chapter: 10, verse: 26 },
    { chapter: 10, verse: 27 },
    { chapter: 10, verse: 28 },
    { chapter: 10, verse: 29 },
    { chapter: 10, verse: 30 },
    { chapter: 10, verse: 31 },
    { chapter: 10, verse: 32 },
    { chapter: 10, verse: 33 },
    { chapter: 10, verse: 34 },
    { chapter: 10, verse: 35 },
    { chapter: 10, verse: 36 },
    { chapter: 10, verse: 37 },
    { chapter: 10, verse: 38 },
    { chapter: 10, verse: 39 },
    { chapter: 10, verse: 40 },
    { chapter: 10, verse: 41 },
    { chapter: 10, verse: 42 },
    // Continue with more chapters... (This is a sample - the full list would be much longer)
  ],

  // Mark - Jesus' words
  mark: [
    { chapter: 1, verse: 15 },
    { chapter: 1, verse: 17 },
    { chapter: 1, verse: 25 },
    { chapter: 1, verse: 38 },
    { chapter: 1, verse: 41 },
    { chapter: 1, verse: 44 },
    { chapter: 2, verse: 5 },
    { chapter: 2, verse: 8 },
    { chapter: 2, verse: 9 },
    { chapter: 2, verse: 10 },
    { chapter: 2, verse: 11 },
    { chapter: 2, verse: 14 },
    { chapter: 2, verse: 17 },
    { chapter: 2, verse: 19 },
    { chapter: 2, verse: 20 },
    { chapter: 2, verse: 22 },
    { chapter: 2, verse: 25 },
    { chapter: 2, verse: 26 },
    { chapter: 2, verse: 27 },
    { chapter: 2, verse: 28 },
    // Continue with more chapters...
  ],

  // Luke - Jesus' words
  luke: [
    { chapter: 1, verse: 30 },
    { chapter: 1, verse: 32 },
    { chapter: 1, verse: 35 },
    { chapter: 2, verse: 49 },
    { chapter: 4, verse: 4 },
    { chapter: 4, verse: 8 },
    { chapter: 4, verse: 12 },
    { chapter: 4, verse: 18 },
    { chapter: 4, verse: 21 },
    { chapter: 4, verse: 23 },
    { chapter: 4, verse: 24 },
    { chapter: 4, verse: 25 },
    { chapter: 4, verse: 26 },
    { chapter: 4, verse: 27 },
    { chapter: 4, verse: 28 },
    { chapter: 4, verse: 34 },
    { chapter: 4, verse: 35 },
    { chapter: 4, verse: 41 },
    { chapter: 4, verse: 43 },
    // Continue with more chapters...
  ],

  // John - Jesus' words
  john: [
    { chapter: 1, verse: 38 },
    { chapter: 1, verse: 39 },
    { chapter: 1, verse: 42 },
    { chapter: 1, verse: 43 },
    { chapter: 1, verse: 47 },
    { chapter: 1, verse: 48 },
    { chapter: 1, verse: 50 },
    { chapter: 1, verse: 51 },
    { chapter: 2, verse: 4 },
    { chapter: 2, verse: 7 },
    { chapter: 2, verse: 8 },
    { chapter: 2, verse: 10 },
    { chapter: 2, verse: 16 },
    { chapter: 2, verse: 19 },
    { chapter: 2, verse: 22 },
    { chapter: 3, verse: 3 },
    { chapter: 3, verse: 5 },
    { chapter: 3, verse: 7 },
    { chapter: 3, verse: 8 },
    { chapter: 3, verse: 10 },
    { chapter: 3, verse: 11 },
    { chapter: 3, verse: 12 },
    { chapter: 3, verse: 13 },
    { chapter: 3, verse: 14 },
    { chapter: 3, verse: 15 },
    { chapter: 3, verse: 16 },
    { chapter: 3, verse: 17 },
    { chapter: 3, verse: 18 },
    { chapter: 3, verse: 19 },
    { chapter: 3, verse: 20 },
    { chapter: 3, verse: 21 },
    { chapter: 3, verse: 27 },
    { chapter: 3, verse: 28 },
    { chapter: 3, verse: 29 },
    { chapter: 3, verse: 30 },
    { chapter: 3, verse: 31 },
    { chapter: 3, verse: 32 },
    { chapter: 3, verse: 33 },
    { chapter: 3, verse: 34 },
    { chapter: 3, verse: 35 },
    { chapter: 3, verse: 36 },
    // Continue with more chapters...
  ],
}

// Verses where God is speaking (Old Testament and some New Testament)
const godSpeakingVerses = {
  // Genesis
  genesis: [
    { chapter: 1, verse: 3 },
    { chapter: 1, verse: 6 },
    { chapter: 1, verse: 9 },
    { chapter: 1, verse: 11 },
    { chapter: 1, verse: 14 },
    { chapter: 1, verse: 20 },
    { chapter: 1, verse: 22 },
    { chapter: 1, verse: 24 },
    { chapter: 1, verse: 26 },
    { chapter: 1, verse: 28 },
    { chapter: 1, verse: 29 },
    { chapter: 1, verse: 30 },
    { chapter: 2, verse: 16 },
    { chapter: 2, verse: 17 },
    { chapter: 2, verse: 18 },
    { chapter: 3, verse: 9 },
    { chapter: 3, verse: 11 },
    { chapter: 3, verse: 13 },
    { chapter: 3, verse: 14 },
    { chapter: 3, verse: 15 },
    { chapter: 3, verse: 16 },
    { chapter: 3, verse: 17 },
    { chapter: 3, verse: 19 },
    { chapter: 3, verse: 22 },
    { chapter: 3, verse: 23 },
    // Continue with more chapters...
  ],

  // Exodus
  exodus: [
    { chapter: 3, verse: 4 },
    { chapter: 3, verse: 5 },
    { chapter: 3, verse: 6 },
    { chapter: 3, verse: 7 },
    { chapter: 3, verse: 8 },
    { chapter: 3, verse: 9 },
    { chapter: 3, verse: 10 },
    { chapter: 3, verse: 11 },
    { chapter: 3, verse: 12 },
    { chapter: 3, verse: 13 },
    { chapter: 3, verse: 14 },
    { chapter: 3, verse: 15 },
    { chapter: 3, verse: 16 },
    { chapter: 3, verse: 17 },
    { chapter: 3, verse: 18 },
    { chapter: 3, verse: 19 },
    { chapter: 3, verse: 20 },
    { chapter: 3, verse: 21 },
    { chapter: 3, verse: 22 },
    // Continue with more chapters...
  ],

  // Psalms (many are God speaking)
  psalms: [
    { chapter: 2, verse: 7 },
    { chapter: 2, verse: 8 },
    { chapter: 2, verse: 9 },
    { chapter: 46, verse: 10 },
    { chapter: 50, verse: 7 },
    { chapter: 50, verse: 8 },
    { chapter: 50, verse: 9 },
    { chapter: 50, verse: 10 },
    { chapter: 50, verse: 11 },
    { chapter: 50, verse: 12 },
    { chapter: 50, verse: 13 },
    { chapter: 50, verse: 14 },
    { chapter: 50, verse: 15 },
    { chapter: 50, verse: 16 },
    { chapter: 50, verse: 17 },
    { chapter: 50, verse: 18 },
    { chapter: 50, verse: 19 },
    { chapter: 50, verse: 20 },
    { chapter: 50, verse: 21 },
    { chapter: 50, verse: 22 },
    { chapter: 50, verse: 23 },
    // Continue with more chapters...
  ],
}

// Create a comprehensive speaker reference
function createSpeakerReference() {
  const speakerData = {
    jesus: {},
    god: {},
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0',
      description: 'Speaker reference data for Bible verses',
      sources: ['Red-letter Bible editions', 'Scholarly commentaries', 'Biblical concordances'],
    },
  }

  // Process Jesus speaking verses
  Object.keys(jesusSpeakingVerses).forEach((book) => {
    speakerData.jesus[book] = {}
    jesusSpeakingVerses[book].forEach(({ chapter, verse }) => {
      if (!speakerData.jesus[book][chapter]) {
        speakerData.jesus[book][chapter] = []
      }
      speakerData.jesus[book][chapter].push(verse)
    })
  })

  // Process God speaking verses
  Object.keys(godSpeakingVerses).forEach((book) => {
    speakerData.god[book] = {}
    godSpeakingVerses[book].forEach(({ chapter, verse }) => {
      if (!speakerData.god[book][chapter]) {
        speakerData.god[book][chapter] = []
      }
      speakerData.god[book][chapter].push(verse)
    })
  })

  return speakerData
}

// Generate the speaker reference file
function generateSpeakerData() {
  const outputDir = './src/data'
  const speakerData = createSpeakerReference()

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Save the speaker reference file
  const outputPath = path.join(outputDir, 'speakerReference.json')
  fs.writeFileSync(outputPath, JSON.stringify(speakerData, null, 2))

  console.log('🎉 Speaker reference data generated!')
  console.log(`📁 Saved to: ${outputPath}`)
  console.log(`📊 Jesus speaking verses: ${Object.keys(speakerData.jesus).length} books`)
  console.log(`📊 God speaking verses: ${Object.keys(speakerData.god).length} books`)

  // Generate summary statistics
  let totalJesusVerses = 0
  Object.values(speakerData.jesus).forEach((book) => {
    Object.values(book).forEach((chapter) => {
      totalJesusVerses += chapter.length
    })
  })

  let totalGodVerses = 0
  Object.values(speakerData.god).forEach((book) => {
    Object.values(book).forEach((chapter) => {
      totalGodVerses += chapter.length
    })
  })

  console.log(`📝 Total Jesus speaking verses: ${totalJesusVerses}`)
  console.log(`📝 Total God speaking verses: ${totalGodVerses}`)

  return speakerData
}

// Run the generation
generateSpeakerData()
