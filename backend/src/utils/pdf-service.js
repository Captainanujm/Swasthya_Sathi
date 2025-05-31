const pdfParse = require('pdf-parse');
const natural = require('natural');
const fs = require('fs-extra');
const path = require('path');

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

/**
 * Process a PDF file to extract text and generate a summary
 * @param {string} filePath - Path to the uploaded PDF file
 * @returns {Promise<object>} The generated summary and test results
 */
async function processPDF(filePath) {
  try {
    console.log('Processing PDF file:', filePath);
    
    // Read the PDF file
    const dataBuffer = await fs.readFile(filePath);
    console.log('PDF file size:', dataBuffer.length, 'bytes');
    
    // Parse the PDF with options
    const options = {
      max: 15, // Only parse the first 15 pages
      version: 'default'
    };
    
    const data = await pdfParse(dataBuffer, options);
    
    // Check if we got valid text content
    if (!data.text || data.text.trim().length === 0) {
      console.log('No text content found in PDF');
      return {
        summary: "No readable text content was found in this PDF. The file may be encrypted, contain only images, or use a format that can't be processed.",
        testResults: []
      };
    }
    
    // Clean up the text content before summarization
    const cleanText = cleanPdfText(data.text);
    console.log('Extracted text length:', cleanText.length);
    
    // Generate summary
    const summary = summarizeText(cleanText);
    
    // Extract test results
    const testResults = extractTestResults(cleanText);
    console.log('Extracted test results:', testResults.length);
    
    // Delete the file after processing
    await fs.remove(filePath);
    console.log('Deleted temporary file:', filePath);
    
    return {
      summary,
      testResults
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Ensure file is deleted even if processing fails
    try {
      await fs.remove(filePath);
      console.log('Deleted temporary file after error:', filePath);
    } catch (deleteError) {
      console.error('Error deleting file:', deleteError);
    }
    
    return {
      summary: "There was an error processing this PDF file. The file may be corrupted, password-protected, or in an unsupported format.",
      testResults: []
    };
  }
}

/**
 * Clean up text extracted from PDF
 * @param {string} text - Raw text from PDF
 * @returns {string} Cleaned text
 */
function cleanPdfText(text) {
  if (!text) return '';
  
  return text
    // Replace multiple line breaks with a single one
    .replace(/\n{3,}/g, '\n\n')
    // Replace non-printable characters
    .replace(/[^\x20-\x7E\n\t]/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/\s{2,}/g, ' ')
    // Trim whitespace
    .trim();
}

/**
 * Extract test results from the PDF text
 * @param {string} text - Text extracted from the PDF
 * @returns {Array} Array of test result objects
 */
function extractTestResults(text) {
  // Common lab test names and their aliases
  const labTests = {
    'hemoglobin': ['hgb', 'hb'],
    'white blood cells': ['wbc', 'leukocytes', 'white cell count'],
    'red blood cells': ['rbc', 'erythrocytes', 'red cell count'],
    'platelets': ['plt', 'thrombocytes'],
    'glucose': ['blood sugar', 'fbs', 'blood glucose'],
    'cholesterol': ['total cholesterol', 'tc'],
    'hdl cholesterol': ['hdl-c', 'high-density lipoprotein'],
    'ldl cholesterol': ['ldl-c', 'low-density lipoprotein'],
    'triglycerides': ['tg'],
    'hba1c': ['glycated hemoglobin', 'a1c'],
    'creatinine': ['creat'],
    'urea': ['bun', 'blood urea nitrogen'],
    'uric acid': ['ua'],
    'alt': ['alanine transaminase', 'sgpt'],
    'ast': ['aspartate transaminase', 'sgot'],
    'tsh': ['thyroid stimulating hormone'],
    'neutrophils': ['neut'],
    'lymphocytes': ['lymph'],
    'monocytes': ['mono'],
    'eosinophils': ['eos'],
    'basophils': ['baso']
  };
  
  // Common units and their reference ranges
  const referenceRanges = {
    'hemoglobin': { min: 12, max: 17, unit: 'g/dL' },
    'white blood cells': { min: 4, max: 11, unit: 'x10^9/L' },
    'red blood cells': { min: 4.2, max: 5.8, unit: 'x10^12/L' },
    'platelets': { min: 150, max: 450, unit: 'x10^9/L' },
    'glucose': { min: 70, max: 100, unit: 'mg/dL' },
    'cholesterol': { min: 0, max: 200, unit: 'mg/dL' },
    'hdl cholesterol': { min: 40, max: 60, unit: 'mg/dL' },
    'ldl cholesterol': { min: 0, max: 100, unit: 'mg/dL' },
    'triglycerides': { min: 0, max: 150, unit: 'mg/dL' },
    'hba1c': { min: 4, max: 5.7, unit: '%' },
    'creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL' },
    'urea': { min: 7, max: 20, unit: 'mg/dL' },
    'uric acid': { min: 3.5, max: 7.2, unit: 'mg/dL' },
    'alt': { min: 0, max: 40, unit: 'U/L' },
    'ast': { min: 0, max: 40, unit: 'U/L' },
    'tsh': { min: 0.4, max: 4.0, unit: 'mIU/L' },
    'neutrophils': { min: 40, max: 70, unit: '%' },
    'lymphocytes': { min: 20, max: 40, unit: '%' },
    'monocytes': { min: 2, max: 10, unit: '%' },
    'eosinophils': { min: 1, max: 6, unit: '%' },
    'basophils': { min: 0, max: 2, unit: '%' }
  };
  
  const testResults = [];
  
  // For each test in our dictionary, try to extract values
  Object.entries(labTests).forEach(([testName, aliases]) => {
    // Create a regex pattern including the main test name and its aliases
    const allNames = [testName, ...aliases].map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const pattern = new RegExp(`(?:${allNames})\\s*(?::|-|=|\\s)\\s*(\\d+\\.?\\d*)\\s*(\\w+(?:/\\w+)?)?`, 'i');
    
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      const extractedUnit = match[2] || referenceRanges[testName]?.unit || '';
      
      // Get reference range
      const range = referenceRanges[testName] || { min: null, max: null, unit: extractedUnit };
      
      // Determine status based on reference range
      let status = 'unknown';
      if (range.min !== null && range.max !== null) {
        if (value < range.min) {
          status = 'low';
        } else if (value > range.max) {
          status = 'high';
        } else {
          status = 'normal';
        }
      }
      
      // Format the test name to be more readable (capitalize first letter of each word)
      const formattedName = testName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      testResults.push({
        name: formattedName,
        value,
        unit: extractedUnit || range.unit,
        referenceRange: {
          min: range.min,
          max: range.max
        },
        status
      });
    }
  });
  
  return testResults;
}

/**
 * Summarize text using TF-IDF to find important sentences
 * @param {string} text - The text to summarize
 * @returns {string} A summary of 5-6 lines
 */
function summarizeText(text) {
  // If text is too short, return it as is
  if (text.length < 500) {
    return `This document is quite short. Here's the content: ${text}`;
  }
  
  try {
    // Split text into sentences
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    
    if (sentences.length === 0) {
      return "Could not generate a summary. The document may not contain enough text in a readable format.";
    }
    
    // Clean sentences
    const cleanSentences = sentences.map(sentence => 
      sentence.replace(/\s+/g, ' ').trim()
    ).filter(sentence => sentence.length > 20 && sentence.length < 300);
    
    if (cleanSentences.length === 0) {
      return "Could not generate a summary. The document may not contain enough meaningful text.";
    }
    
    // Use TF-IDF to score sentences
    const tfidf = new TfIdf();
    
    // Add all sentences to the TF-IDF model
    cleanSentences.forEach(sentence => {
      tfidf.addDocument(tokenizer.tokenize(sentence));
    });
    
    // Score each sentence
    const scores = cleanSentences.map((sentence, i) => {
      const tokens = tokenizer.tokenize(sentence);
      let score = 0;
      
      tokens.forEach(token => {
        const stem = stemmer.stem(token);
        score += tfidf.tfidf(stem, i);
      });
      
      // Normalize by sentence length to avoid favoring long sentences too much
      score = score / (tokens.length || 1);
      
      return { sentence, score, index: i };
    });
    
    // Sort by score and get top 5-6 sentences
    const topSentences = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .sort((a, b) => a.index - b.index) // Sort by position in original text
      .map(item => item.sentence);
    
    // Process the summary to make it more readable
    let summary = topSentences.join(' ');
    
    // Enhance the summary with key phrase extraction
    const medicalTerms = extractMedicalTerms(text);
    
    // If summary is too short, add some context about medical terms
    if (summary.length < 100 && medicalTerms.length > 0) {
      summary += ` Key terms: ${medicalTerms.join(', ')}.`;
    }
    
    // Simplify medical language if possible
    summary = simplifyMedicalLanguage(summary);
    
    return summary;
  } catch (error) {
    console.error('Error in summarizeText:', error);
    return "An error occurred while generating the summary. The document may contain complex formatting or non-standard text.";
  }
}

/**
 * Extract potential medical terms from text
 * @param {string} text - The text to analyze
 * @returns {string[]} Array of potential medical terms
 */
function extractMedicalTerms(text) {
  // Common medical terms and prefixes to look for
  const medicalPrefixes = ['diagnos', 'prescript', 'treatment', 'test', 'result', 'condition', 'patient', 'mg', 'dose', 'symptom'];
  
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const terms = new Set();
  
  tokens.forEach(token => {
    if (token.length > 5) {
      const stem = stemmer.stem(token);
      
      if (medicalPrefixes.some(prefix => stem.includes(prefix))) {
        // Find the original term in the text
        const regex = new RegExp(`\\b${token}\\w*\\b`, 'i');
        const match = text.match(regex);
        
        if (match && match[0]) {
          terms.add(match[0]);
        }
      }
    }
  });
  
  return Array.from(terms).slice(0, 5);
}

/**
 * Simplify medical language to make it more accessible
 * @param {string} text - Text to simplify
 * @returns {string} Simplified text
 */
function simplifyMedicalLanguage(text) {
  // Map of complex terms to simpler explanations
  const simplifications = {
    'hypertension': 'high blood pressure',
    'myocardial infarction': 'heart attack',
    'cerebrovascular accident': 'stroke',
    'neoplasm': 'tumor',
    'malignant': 'cancerous',
    'benign': 'non-cancerous',
    'edema': 'swelling',
    'dyspnea': 'difficulty breathing',
    'hyperlipidemia': 'high cholesterol',
    'hyperglycemia': 'high blood sugar'
  };
  
  let simplified = text;
  
  // Replace complex terms with simplifications
  Object.entries(simplifications).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(regex, `${simple} (${complex})`);
  });
  
  return simplified;
}

module.exports = {
  processPDF
}; 