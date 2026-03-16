import { Review } from '../types';
import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, query, where, getDoc } from 'firebase/firestore';

export const reviewService = {
    getReviews: async (businessName: string): Promise<Review[]> => {
        try {
            const q = query(collection(db, 'reviews'), where('businessName', '==', businessName));
            const querySnapshot = await getDocs(q);
            const reviews: Review[] = [];
            querySnapshot.forEach((doc) => {
                reviews.push(doc.data() as Review);
            });
            return reviews;
        } catch (e) {
            console.error("Error reading reviews from Firestore", e);
            return [];
        }
    },
    addReview: async (businessName: string, review: Review) => {
        try {
            const reviewRef = doc(collection(db, 'reviews'));
            await setDoc(reviewRef, { ...review, businessName });
        } catch (e) {
            console.error("Error saving review to Firestore", e);
        }
    },
    getAverageRating: async (businessName: string): Promise<number | null> => {
        const reviews = await reviewService.getReviews(businessName);
        if (reviews.length === 0) return null;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / reviews.length;
    }
};
