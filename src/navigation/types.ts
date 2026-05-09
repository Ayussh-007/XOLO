export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Camera: { mode: 'camera' | 'gallery' };
  Result: { imageUri: string };
  History: undefined;
};
