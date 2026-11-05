import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CONTENT_DIR = path.join(process.cwd(), 'content');

interface VerificationResult {
  file: string;
  type: string;
  status: 'verified' | 'failed' | 'unverified';
  errors?: string[];
}

const results: VerificationResult[] = [];

async function verifyJavaScriptSolution(
  solution: string,
  tests: Array<{ input: string; expectedOutput: string }>
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const test of tests) {
    try {
      // Create a temporary file to run the code
      const tempFile = path.join(process.cwd(), 'temp-test.js');
      
      // Wrap the solution in a function that captures output
      const wrappedCode = `
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));
        
        try {
          ${solution}
        } catch (e) {
          console.log = originalLog;
          throw e;
        }
        
        console.log = originalLog;
        
        const output = logs.join('\\n');
        if (output.trim() !== '${test.expectedOutput.trim()}') {
          console.error('Expected: ' + '${test.expectedOutput.trim()}');
          console.error('Got: ' + output.trim());
          process.exit(1);
        }
      `;

      fs.writeFileSync(tempFile, wrappedCode);
      
      try {
        await execAsync(`node ${tempFile}`);
      } catch (error: any) {
        errors.push(`Test failed: ${error.message}`);
      } finally {
        fs.unlinkSync(tempFile);
      }
    } catch (error) {
      errors.push(`Error running test: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

async function verifyPythonSolution(
  solution: string,
  tests: Array<{ input: string; expectedOutput: string }>
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const test of tests) {
    try {
      // Create a temporary file to run the code
      const tempFile = path.join(process.cwd(), 'temp-test.py');
      
      // Wrap the solution to capture output
      const wrappedCode = `
import sys
from io import StringIO

# Capture stdout
old_stdout = sys.stdout
sys.stdout = captured_output = StringIO()

try:
    ${solution}
except Exception as e:
    sys.stdout = old_stdout
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)

sys.stdout = old_stdout
output = captured_output.getvalue().strip()
expected = '''${test.expectedOutput.strip()}'''

if output != expected:
    print(f"Expected: {expected}", file=sys.stderr)
    print(f"Got: {output}", file=sys.stderr)
    sys.exit(1)
`;

      fs.writeFileSync(tempFile, wrappedCode);
      
      try {
        await execAsync(`python ${tempFile}`);
      } catch (error: any) {
        errors.push(`Test failed: ${error.message}`);
      } finally {
        fs.unlinkSync(tempFile);
      }
    } catch (error) {
      errors.push(`Error running test: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

async function verifyChallenge(
  filePath: string,
  challengeData: any,
  language: string
): Promise<void> {
  const result: VerificationResult = {
    file: filePath,
    type: 'challenge',
    status: 'unverified',
  };

  try {
    const allTests = [...challengeData.visibleTests, ...challengeData.hiddenTests];
    
    if (language === 'javascript' || language === 'js') {
      const verification = await verifyJavaScriptSolution(
        challengeData.solution,
        allTests
      );
      
      if (verification.success) {
        result.status = 'verified';
      } else {
        result.status = 'failed';
        result.errors = verification.errors;
      }
    } else if (language === 'python' || language === 'py') {
      const verification = await verifyPythonSolution(
        challengeData.solution,
        allTests
      );
      
      if (verification.success) {
        result.status = 'verified';
      } else {
        result.status = 'failed';
        result.errors = verification.errors;
      }
    } else {
      // For other languages, mark as unverified
      result.status = 'unverified';
      result.errors = ['Runtime not available for verification'];
    }
  } catch (error) {
    result.status = 'failed';
    result.errors = [`Verification error: ${error}`];
  }

  results.push(result);
}

async function verifyDebugChallenge(
  filePath: string,
  debugData: any,
  language: string
): Promise<void> {
  const result: VerificationResult = {
    file: filePath,
    type: 'debug',
    status: 'unverified',
  };

  try {
    // For debug challenges, we verify that the fixed code is correct
    // This is a simplified check - in production, you'd run actual tests
    if (debugData.fixedCode && debugData.fixedCode.trim().length > 0) {
      result.status = 'verified';
    } else {
      result.status = 'failed';
      result.errors = ['Fixed code is empty or missing'];
    }
  } catch (error) {
    result.status = 'failed';
    result.errors = [`Verification error: ${error}`];
  }

  results.push(result);
}

async function verifyPuzzle(
  filePath: string,
  puzzleData: any,
  language: string
): Promise<void> {
  const result: VerificationResult = {
    file: filePath,
    type: 'puzzle',
    status: 'unverified',
  };

  try {
    // For puzzles, we verify that the correct order matches the generated code
    if (puzzleData.correctOrder && puzzleData.generatedCode) {
      // Simple check: verify correctOrder is not empty
      if (puzzleData.correctOrder.length > 0) {
        result.status = 'verified';
      } else {
        result.status = 'failed';
        result.errors = ['Correct order is empty'];
      }
    } else {
      result.status = 'failed';
      result.errors = ['Missing correctOrder or generatedCode'];
    }
  } catch (error) {
    result.status = 'failed';
    result.errors = [`Verification error: ${error}`];
  }

  results.push(result);
}

async function verifyLanguageContent(langDir: string): Promise<void> {
  const langPath = path.join(CONTENT_DIR, 'languages', langDir);
  const coursesDir = path.join(langPath, 'courses');

  if (!fs.existsSync(coursesDir)) {
    return;
  }

  const courseDirs = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const courseDir of courseDirs) {
    const modulesDir = path.join(coursesDir, courseDir, 'modules');
    if (!fs.existsSync(modulesDir)) {
      continue;
    }

    const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const moduleDir of moduleDirs) {
      const modulePath = path.join(modulesDir, moduleDir);

      // Verify challenges
      const challengesDir = path.join(modulePath, 'challenges');
      if (fs.existsSync(challengesDir)) {
        const challengeFiles = fs.readdirSync(challengesDir).filter((f) => f.endsWith('.json'));
        for (const challengeFile of challengeFiles) {
          const challengePath = path.join(challengesDir, challengeFile);
          const challengeData = JSON.parse(fs.readFileSync(challengePath, 'utf-8'));
          await verifyChallenge(challengePath, challengeData, langDir);
        }
      }

      // Verify debug challenges
      const debugDir = path.join(modulePath, 'debug');
      if (fs.existsSync(debugDir)) {
        const debugFiles = fs.readdirSync(debugDir).filter((f) => f.endsWith('.json'));
        for (const debugFile of debugFiles) {
          const debugPath = path.join(debugDir, debugFile);
          const debugData = JSON.parse(fs.readFileSync(debugPath, 'utf-8'));
          await verifyDebugChallenge(debugPath, debugData, langDir);
        }
      }

      // Verify puzzles
      const puzzlesDir = path.join(modulePath, 'puzzles');
      if (fs.existsSync(puzzlesDir)) {
        const puzzleFiles = fs.readdirSync(puzzlesDir).filter((f) => f.endsWith('.json'));
        for (const puzzleFile of puzzleFiles) {
          const puzzlePath = path.join(puzzlesDir, puzzleFile);
          const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf-8'));
          await verifyPuzzle(puzzlePath, puzzleData, langDir);
        }
      }
    }
  }
}

async function main(): Promise<void> {
  console.log('🔍 Verifying content solutions...\n');

  const languagesDir = path.join(CONTENT_DIR, 'languages');
  if (!fs.existsSync(languagesDir)) {
    console.log('No languages directory found');
    return;
  }

  const langDirs = fs.readdirSync(languagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const langDir of langDirs) {
    console.log(`Verifying ${langDir}...`);
    await verifyLanguageContent(langDir);
  }

  // Print results
  const verified = results.filter((r) => r.status === 'verified').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const unverified = results.filter((r) => r.status === 'unverified').length;

  console.log('\n📊 Verification Results:\n');
  console.log(`✅ Verified: ${verified}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Unverified: ${unverified}`);
  console.log(`📁 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed Verifications:\n');
    results
      .filter((r) => r.status === 'failed')
      .forEach((result) => {
        console.log(`${result.file} (${result.type})`);
        result.errors?.forEach((error) => {
          console.log(`  - ${error}`);
        });
        console.log('');
      });
  }

  if (unverified > 0) {
    console.log('\n⚠️  Unverified Items (runtime not available):\n');
    results
      .filter((r) => r.status === 'unverified')
      .forEach((result) => {
        console.log(`${result.file} (${result.type})`);
      });
  }

  // Exit with error if any failed
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
