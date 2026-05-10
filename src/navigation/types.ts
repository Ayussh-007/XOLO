export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Splash: undefined;
  Home: undefined;
  Camera: { mode: 'camera' | 'gallery' };
  Result: { imageUri: string };
  MoodSelection: { imageUri: string };
  Performance: undefined;
  History: undefined;
};
