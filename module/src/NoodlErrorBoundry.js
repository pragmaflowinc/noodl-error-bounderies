import { defineReactNode } from "@noodl/noodl-sdk";
import { ErrorBoundary } from "react-error-boundary";
import { useCallback, useEffect, useState } from "react";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      {error && <pre>{error.message}</pre>}
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function NoodlErrorBoundery({
  children,
  nodeScope,
  errorFallbackComponent,
  onReset,
  setErrorInfo,
  onError,
}) {
  const [noodlNode, setNoodlNode] = useState(null);
  useEffect(() => {
    if (nodeScope && errorFallbackComponent) {
      (async () => {
        const createNoodlNode = await nodeScope.createNode(
          errorFallbackComponent,
          undefined,
          {}
        );
        setNoodlNode(createNoodlNode);
      })();
    } else {
      setNoodlNode(null);
    }
  }, [nodeScope, errorFallbackComponent]);
  return (
    <ErrorBoundary
      FallbackComponent={(props) => {
        if (noodlNode) {
          noodlNode.setInputValue("error", props.error);
          noodlNode.setInputValue(
            "resetErrorBoundary",
            props.resetErrorBoundary
          );
          return noodlNode.render();
        }
        return <ErrorFallback {...props} />;
      }}
      onReset={() => {
        setErrorInfo({ inError: false });
        onReset();
      }}
      onError={(error) => {
        setErrorInfo({ inError: true, errorMessage: error.message });

        onError();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export const NoodleErrorBounderyNode = defineReactNode({
  name: "Error Boundery",
  category: "Utilities",
  getReactComponent() {
    return NoodlErrorBoundery;
  },
  initialize() {
    this.setOutputs({ inError: false });
    this.props.nodeScope = this.nodeScope;
    this.props.setErrorInfo = (errorInfo) =>
      this.setOutputs({
        inError: errorInfo.inError,
        errorMessage: errorInfo.errorMessage,
      });
  },
  inputProps: {
    errorFallbackComponent: {
      type: "component",
      displayName: "Error Fallback Component",
    },
  },
  outputs: {
    inError: { type: "boolean", displayName: "In Error" },
    errorMessage: { type: "string", displayName: "Error Message" },
  },
  outputProps: {
    onError: { type: "signal", displayName: "On Error" },
    onReset: { type: "signal", displayName: "On Reset" },
  },
});
