import bcrypt from "bcrypt";
import { JobData, JobResult } from "../types";

export class JobProcessors {
  /**
   * Calculate prime numbers up to a limit
   */
  static calculatePrimes(limit: number): number[] {
    const primes: number[] = [];
    for (let i = 2; i <= limit; i++) {
      if (primes.every((p) => i % p !== 0)) {
        primes.push(i);
      }
    }
    return primes;
  }

  /**
   * Generate and sort a large array
   */
  static generateAndSortArray(size: number): number[] {
    const arr = Array.from({ length: size }, () =>
      Math.floor(Math.random() * size)
    );
    return arr.sort((a, b) => a - b);
  }

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string, rounds: number = 10): Promise<string> {
    return await bcrypt.hash(password, rounds);
  }

  /**
   * Process a job based on its type
   */
  static async processJob(jobData: JobData): Promise<JobResult> {
    const start = Date.now();
    
    try {
      let result: any;

      switch (jobData.type) {
        case "prime":
          result = this.calculatePrimes(100000);
          break;
        case "bcrypt":
          result = await this.hashPassword("password", 10);
          break;
        case "sort":
          result = this.generateAndSortArray(100000);
          break;
        default:
          throw new Error(`Unknown job type: ${jobData.type}`);
      }

      const processingTime = (Date.now() - start) / 1000;

      return {
        success: true,
        result,
        processingTime,
      };
    } catch (error) {
      const processingTime = (Date.now() - start) / 1000;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processingTime,
      };
    }
  }
}
