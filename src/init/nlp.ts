import nlp from "compromise";
import type { SpeechMethods } from "compromise-speech";
import speechPlugin from "compromise-speech";

nlp.plugin(speechPlugin);

export default nlp<SpeechMethods>;
