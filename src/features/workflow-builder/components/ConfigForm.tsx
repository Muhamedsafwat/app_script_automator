import { ConfigFormHeader } from "./ConfigFormHeader";
import { ConfigFormBody } from "./ConfigFormBody";
import { ConfigFormFooter } from "./ConfigFormFooter";
import { useConfigForm } from "./useConfigForm";

export default function ConfigForm() {
  const {
    metadata,
    fields,
    bindingModes,
    setBindingModes,
    handleFieldChange,
    errors,
    touched,
    availableBindings,
    canHaveOutput,
    outputs,
    addOutput,
    changeOutput,
    deleteOutput,
    handleSave,
    setSelectedNodeId,
    node,
    CategoryIcon,
  } = useConfigForm();

  // If node not found or loading, render nothing
  if (!node) return null;

  const onClose = () => setSelectedNodeId(null);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md text-white flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <ConfigFormHeader
          metadata={metadata}
          categoryIcon={CategoryIcon}
          onClose={onClose}
        />
        <ConfigFormBody
          fields={fields}
          node={node}
          bindingModes={bindingModes}
          setBindingModes={setBindingModes}
          handleFieldChange={handleFieldChange}
          errors={errors}
          touched={touched}
          availableBindings={availableBindings}
          canHaveOutput={canHaveOutput}
          outputs={outputs}
          addOutput={addOutput}
          changeOutput={changeOutput}
          deleteOutput={deleteOutput}
        />
        <ConfigFormFooter onSave={handleSave} />
      </div>
    </div>
  );
}