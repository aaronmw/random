export const tooltips = {
  // Modes
  range: (propertyName: string) => (
    <>
      <p>
        For each selected node, generates a random <code>{propertyName}</code>{' '}
        between a minimum and maximum value
      </p>
    </>
  ),
  list: (propertyName: string) => (
    <>
      <p>
        For each selected node, generates a random <code>{propertyName}</code>{' '}
        from a list of possible values
      </p>
    </>
  ),
  calc: (propertyName: string) => (
    <>
      <p>
        For each selected node, generates a random number between a minimum and
        maximum value, then adds or multiplies the current{' '}
        <code>{propertyName}</code> by that number
      </p>
    </>
  ),

  // Fields
  operator: (propertyName: string) => (
    <>
      <p>
        The mathematical operation to perform on the generated random numbers
        and each node's current <code>{propertyName}</code>.
      </p>
    </>
  ),
  sortOrder: (propertyName: string) => (
    <>
      <p>
        For all selected nodes, generates random values for{' '}
        <code>{propertyName}</code>, then optionally sorts them in ascending or
        descending order before applying them
      </p>
    </>
  ),
  transformOrigin: (propertyName: string) => (
    <>
      <p>
        The point around which <strong>each selected node</strong> is scaled or
        rotated when changing its <code>{propertyName}</code>
      </p>
    </>
  ),
}
