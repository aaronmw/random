import { PropertyNameTag } from '@/components/PropertyNameTag'

export const tooltips = {
  // Modes
  range: (propertyName: string) => (
    <>
      <p>
        <strong>Range</strong>
        <br />
        For each selected node, generates a random{' '}
        <PropertyNameTag>{propertyName}</PropertyNameTag> between a minimum
        and&nbsp;maximum&nbsp;value
      </p>
    </>
  ),
  list: (propertyName: string) => (
    <>
      <p>
        <strong>List</strong>
        <br />
        For each selected node, generates a random{' '}
        <PropertyNameTag>{propertyName}</PropertyNameTag> from a list
        of&nbsp;possible&nbsp;values
      </p>
    </>
  ),
  calc: (propertyName: string) => (
    <>
      <p>
        <strong>Calculate</strong>
        <br />
        For each selected node, generates a random number between a minimum and
        maximum value, then adds or multiplies the current{' '}
        <PropertyNameTag>{propertyName}</PropertyNameTag>{' '}
        by&nbsp;that&nbsp;number
      </p>
    </>
  ),

  // Fields
  operator: (propertyName: string) => (
    <>
      <p>
        The mathematical operation to perform on the generated random numbers
        and each node&rsquo;s current&nbsp;
        <PropertyNameTag>{propertyName}</PropertyNameTag>.
      </p>
    </>
  ),
  sortOrder: (propertyName: string) => (
    <>
      <p>
        For all selected nodes, generates random values for{' '}
        <PropertyNameTag>{propertyName}</PropertyNameTag>, then optionally sorts
        them in ascending or descending order before&nbsp;applying&nbsp;them
      </p>
    </>
  ),
  transformOrigin: (propertyName: string) => (
    <>
      <p>
        The point around which <strong>each selected node</strong> is scaled or
        rotated when changing its&nbsp;
        <PropertyNameTag>{propertyName}</PropertyNameTag>
      </p>
    </>
  ),
  presetsMenu: (
    <>
      <p>
        Choose a preset to load. It will override unsaved changes to properties
        enabled in&nbsp;the&nbsp;preset.
      </p>
    </>
  ),
  presetsMenuEmpty: (
    <>
      <p>You haven&rsquo;t saved any presets&nbsp;yet.</p>
    </>
  ),
  savePresetMenu: (
    <>
      <p>
        Save this configuration as a preset so you can load it again later on
        other&nbsp;projects.
      </p>
    </>
  ),
  savePresetMenuDisabled: (
    <>
      <p>You must enable at least one property to save a&nbsp;preset.</p>
    </>
  ),
  disableAll: (
    <>
      <p>Turns off all property randomization so you can start&nbsp;fresh.</p>
    </>
  ),
  disableAllDisabled: (
    <>
      <p>All properties are already disabled.</p>
    </>
  ),
  enableAll: (
    <>
      <p>Turns on all property randomization.</p>
    </>
  ),
  stopRandomizing: (propertyName: string) => (
    <>
      <p>
        Stop randomizing <PropertyNameTag>{propertyName}</PropertyNameTag>
      </p>
    </>
  ),
  savePreset: (
    <>
      <p>
        Save this configuration as a preset. You can load it later to apply the
        same settings to&nbsp;other&nbsp;nodes.
      </p>
    </>
  ),
  loadPreset: (
    <>
      <p>
        Load a saved preset to apply its configuration to the current selection.
      </p>
    </>
  ),
  groupByStatus: (
    <>
      <p>Show enabled properties at the top of the list.</p>
    </>
  ),
  groupByType: (
    <>
      <p>Group properties by their type (layout, fill, stroke, etc.).</p>
    </>
  ),
  autoScroll: (
    <>
      <p>Automatically scroll to newly enabled properties.</p>
    </>
  ),
  execute: (
    <>
      <p>Apply the current randomization settings to selected nodes.</p>
    </>
  ),
}
