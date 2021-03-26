## Configuration

You can configure `r3f-perf` by using the `<Perf>` component anywhere in your App:

```jsx
import { Perf } from 'r3f-perf'

export default function MyApp() {

  return (
    <>
      <Perf
        theme={myTheme}  // you can pass a custom theme (see the styling section)
        fill             // default = false,  true makes the pane fill the parent dom node it's rendered in
        flat             // default = false,  true removes border radius and shadow
        oneLineLabels    // default = false, alternative layout for labels, with labels and fields on separate rows  
        hideTitleBar     // default = false, hides the GUI header
        collapsed        // default = false, when true the GUI is collpased
        hidden           // default = false, when true the GUI is hidden
      />
    </>
  )

}
```