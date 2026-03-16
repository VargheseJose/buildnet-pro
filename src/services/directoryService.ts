import { Business } from '../types';
import { DIRECTORY_DATA } from '../data/directory-data';

// This function simulates fetching directory data from an API.
export const fetchDirectoryData = async (): Promise<Business[]> => {
  return new Promise((resolve, reject) => {
    // Simulate a network delay
    setTimeout(() => {
      // To simulate a failure, you could uncomment the following line:
      // reject(new Error('Failed to fetch directory data. Please try again later.'));

      if (DIRECTORY_DATA && DIRECTORY_DATA.length > 0) {
        resolve(DIRECTORY_DATA);
      } else {
        console.error('Directory data is empty or unavailable.');
        reject(new Error('Could not retrieve directory data. The directory may be empty or there was a network issue.'));
      }
    }, 1200);
  });
};
