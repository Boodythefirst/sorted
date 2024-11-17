// src/lib/export-results.ts
import { Session, CategoryResult, CardSimilarity } from "@/types/session"

interface ExportData {
  sessionInfo: {
    title: string
    description: string
    type: string
    participantCount: number
    averageTime: number
  }
  results: CategoryResult[]
  similarities: CardSimilarity[]
  customCategories: string[]
}

function generateCSV(data: ExportData): string {
  const rows: string[] = []

  // Session Info
  rows.push('Session Information')
  rows.push(`Title,${data.sessionInfo.title}`)
  rows.push(`Description,${data.sessionInfo.description}`)
  rows.push(`Type,${data.sessionInfo.type}`)
  rows.push(`Participants,${data.sessionInfo.participantCount}`)
  rows.push(`Average Time,${data.sessionInfo.averageTime}minutes`)
  rows.push('')

  // Category Results
  rows.push('Category Results')
  rows.push('Category Name,Card,Count,Percentage')
  data.results.forEach(category => {
    category.cards
      .filter(card => card.count > 0)
      .forEach(card => {
        rows.push(`${category.name},${card.text},${card.count},${card.percentage}%`)
      })
  })
  rows.push('')

  // Card Relationships
  rows.push('Card Relationships')
  rows.push('Card 1,Card 2,Similarity,Count')
  data.similarities.forEach(sim => {
    rows.push(`${sim.card1},${sim.card2},${sim.similarity}%,${sim.count}`)
  })
  rows.push('')

  // Custom Categories
  if (data.customCategories.length > 0) {
    rows.push('Custom Categories Created')
    data.customCategories.forEach(category => {
      rows.push(category)
    })
  }

  return rows.join('\n')
}

function generateHTML(data: ExportData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.sessionInfo.title} - Results</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; }
          table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
          th, td { padding: 0.5rem; text-align: left; border: 1px solid #ddd; }
          th { background: #f4f4f5; }
          h2 { margin-top: 2rem; }
          .progress-bar { 
            background: #e4e4e7;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
          }
          .progress-bar-fill {
            background: #3b82f6;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <h1>${data.sessionInfo.title}</h1>
        <p>${data.sessionInfo.description}</p>
        
        <h2>Session Information</h2>
        <table>
          <tr><td>Type</td><td>${data.sessionInfo.type}</td></tr>
          <tr><td>Participants</td><td>${data.sessionInfo.participantCount}</td></tr>
          <tr><td>Average Time</td><td>${data.sessionInfo.averageTime} minutes</td></tr>
        </table>

        <h2>Category Results</h2>
        ${data.results.map(category => `
          <div style="margin-bottom: 2rem;">
            <h3>${category.name}</h3>
            <table>
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Distribution</th>
                </tr>
              </thead>
              <tbody>
                ${category.cards
                  .filter(card => card.count > 0)
                  .map(card => `
                    <tr>
                      <td>${card.text}</td>
                      <td>${card.count}</td>
                      <td>${Math.round(card.percentage)}%</td>
                      <td>
                        <div class="progress-bar">
                          <div class="progress-bar-fill" style="width: ${card.percentage}%"></div>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}

        <h2>Card Relationships</h2>
        <table>
          <thead>
            <tr>
              <th>Card 1</th>
              <th>Card 2</th>
              <th>Similarity</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${data.similarities.map(sim => `
              <tr>
                <td>${sim.card1}</td>
                <td>${sim.card2}</td>
                <td>${Math.round(sim.similarity)}%</td>
                <td>${sim.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${data.customCategories.length > 0 ? `
          <h2>Custom Categories</h2>
          <ul>
            ${data.customCategories.map(category => `
              <li>${category}</li>
            `).join('')}
          </ul>
        ` : ''}
      </body>
    </html>
  `
}

export function exportResults(data: ExportData, format: 'json' | 'csv' | 'html') {
  let content: string
  let type: string
  let extension: string

  switch (format) {
    case 'json':
      content = JSON.stringify(data, null, 2)
      type = 'application/json'
      extension = 'json'
      break
    case 'csv':
      content = generateCSV(data)
      type = 'text/csv'
      extension = 'csv'
      break
    case 'html':
      content = generateHTML(data)
      type = 'text/html'
      extension = 'html'
      break
  }

  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${data.sessionInfo.title}-results.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}