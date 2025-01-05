import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchTeam() {
    const querySnapshot = await getDocs(collection(db, 'team'));
    return querySnapshot.docs.map(doc => doc.data());
}