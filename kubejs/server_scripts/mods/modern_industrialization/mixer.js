ServerEvents.recipes(e => {
    let REMOVED_RECIPE = [
        'modern_industrialization:alloy/mixer/electrum/dust',
        'modern_industrialization:alloy/mixer/cupronickel/dust',
        'modern_industrialization:alloy/mixer/electrum/tiny_dust',
        'modern_industrialization:alloy/mixer/cupronickel/tiny_dust'
    ]
    REMOVED_RECIPE.forEach(id => e.remove({id: id}));

    let mi = (id) => `modern_industrialization:${id}`;
    let mc = (id) => `minecraft:${id}`;
    let xps = (id) => `xps:${id}`;

    let mixer = (eu, duration, item_inputs, item_outputs, fluid_inputs, fluid_outputs) => {
        let newRecipe = {
            type: mi('mixer'),
            eu: eu,
            duration: duration
        }

        if (item_inputs)
            newRecipe['item_inputs'] = item_inputs;
        if (item_outputs)
            newRecipe['item_outputs'] = item_outputs;
        if (fluid_inputs)
            newRecipe['fluid_inputs'] = fluid_inputs;
        if (fluid_outputs)
            newRecipe['fluid_outputs'] = fluid_outputs;
        
        e.custom(newRecipe);
    }

    // -- SOULCOPPER BLEND -- //
    mixer(
        2,
        100,
        [
            { amount: 1, item: mc('raw_copper') },
            { amount: 1, item: mc('soul_sand') }
        ],
        [
            { amount: 4, item: xps('soul_copper_blend') }
        ],
        null,
        null
    );    

    let mixerConsumable = (fluid, amount) => {
        if (amount < 100)
            amount = 1000;

        let newFluidInput = {
            fluid: fluid,
            amount: amount
        }

        return newFluidInput;
    }
    
    // -- CONVERT ALL NON-CONSUMABLE FLUID RECIPES IN MIXER TO CONSUME FLUID  -- //
    e.forEachRecipe( { type: mi('mixer') }, recipe => {
        const DONT_REPLACE = [
            'modern_industrialization:vanilla_recipes/mixer/lava',
            'modern_industrialization:compat/ae2/mixer/fluix'
        ];
        const recipeJson = JSON.parse(recipe.json.toString());
        let eu = recipeJson.eu;
        let duration = recipeJson.duration;
        let item_inputs = recipeJson.item_inputs;
        let item_outputs = recipeJson.item_outputs;
        let fluid_inputs = recipeJson.fluid_inputs;
        let fluid_outputs = recipeJson.fluid_outputs;
        let newFluidInput;

        if (fluid_inputs && !DONT_REPLACE.includes(recipe.getId())) {
            if (Array.isArray(fluid_inputs)) {
                let newFluidArr = [];
                for (let key in fluid_inputs) {
                    if (fluid_inputs[key].probability === 0) {
                        newFluidInput = mixerConsumable(
                            fluid_inputs[key].fluid,
                            fluid_inputs[key].amount
                        );
                        newFluidArr.push(newFluidInput);
                    }
                }
                if (newFluidArr.length > 0)
                    newFluidInput = newFluidArr;
            } else {
                if (fluid_inputs.probability === 0) {
                    newFluidInput = mixerConsumable(
                        fluid_inputs.fluid,
                        fluid_inputs.amount
                    );
                }
            }
        }

        if (newFluidInput) {
            e.remove({ id: recipe.getId() });
            mixer(eu, duration, item_inputs, item_outputs, newFluidInput, fluid_outputs);
        }
    });
});