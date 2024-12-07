import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase'; // Ensure you import your Firestore db

export const fetchQuizzesWithStories = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log("User is not authenticated.");
    return null; // Return null if user is not authenticated
  }

  try {
    const quizCollection = collection(db, 'quizzes');
    const quizSnapshot = await getDocs(quizCollection);

    if (quizSnapshot.empty) {
      console.warn('No quizzes found in the collection.');
      return {}; // Return empty object if no quizzes are found
    }

    const storyMap = {}; // Object to store stories and their associated quizzes

    // Fetch stories associated with quizzes concurrently
    const fetchPromises = quizSnapshot.docs.map(async (quizDoc) => {
      const quizData = { id: quizDoc.id, ...quizDoc.data() };

      // Skip if quiz doesn't have a storyId
      if (!quizData.storyId) {
        console.warn(`Quiz ${quizData.id} does not have a storyId.`);
        return;
      }

      try {
        // Fetch the associated story for each quiz
        const storyRef = doc(db, 'stories', quizData.storyId);
        const storyDoc = await getDoc(storyRef);

        if (storyDoc.exists()) {
          const storyData = storyDoc.data();
          const storyId = storyDoc.id;

          // Initialize the story if not already present in the map
          if (!storyMap[storyId]) {
            storyMap[storyId] = {
              id: storyId,
              title: storyData.title,
              text: storyData.text,
              difficulty: storyData.difficulty, // Include difficulty level
              questions: [], // Array to hold associated questions
            };
          }

          // Add the quiz to the corresponding story's questions array
          storyMap[storyId].questions.push(quizData);
        } else {
          console.warn(`Story with ID ${quizData.storyId} does not exist.`);
        }
      } catch (error) {
        console.error(`Error fetching story for quiz ${quizData.id}:`, error);
      }
    });

    // Wait for all promises to resolve before returning
    await Promise.all(fetchPromises);

    return storyMap; // Return the grouped stories and their quizzes
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    throw err; // Rethrow the error for handling in the calling component
  }
};
