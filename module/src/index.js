import { defineModule } from '@noodl/noodl-sdk'
import { NoodleErrorBounderyNode } from './NoodlErrorBoundry'

defineModule({
    reactNodes: [
    	NoodleErrorBounderyNode
    ],
    nodes:[
    ],
    setup() {
    	//this is called once on startup
    }
});