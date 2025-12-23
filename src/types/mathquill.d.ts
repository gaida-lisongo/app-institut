declare module 'react-mathquill' {
  import { Component } from 'react';

  interface MathQuillProps {
    latex?: string;
    onChange?: (mathField: any) => void;
    config?: any;
    mathquillDidMount?: (mathField: any) => void;
  }

  export class EditableMathField extends Component<MathQuillProps> {}
  export class StaticMathField extends Component<MathQuillProps> {}
  
  export function addStyles(): void;
}

declare module 'mathquill/build/mathquill' {
  export interface MathQuill {
    StaticMath: (element: HTMLElement) => any;
    MathField: (element: HTMLElement, config?: any) => any;
    config: (options: any) => void;
  }
  
  const MQ: MathQuill;
  export default MQ;
}