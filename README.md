# Formula Generator

Have you ever been writing a complicated formula in Notion and thought to yourself: "man, this sucks! I wish there was literally any other way I could do this"?
Well you're in luck, because this is a somewhat complicated but programmer friendly way of getting around the problematic syntax of Notion's formula API.
With this tool you can simply write thoroughly compile checked typescript logic (with all of Notion's builtin functions) and have it translated to a formula quick and easy!

## Usage

This usage guide assumes basic programming profficiency. You don't really need to be typescript expert but you should be familiar with the concept of basic logic and polymorphism

    git clone https://github.com/CharliePalm/NotionFormulaGenerator
    cd NotionFormulaGenerator
    npm i
Now create a typescript file and create your class based on the provided example, or just use the example file and replace with your DB properties and logic, then run
    
    ts-node MyFile.ts

Requirements for creating your formula() function:

1. All if blocks must have an else block.
2. Defining a variable is prohibited.
3. Calling functions that are not a member of the parent class is prohibited, but will not currently throw an error and tell you this is what you did wrong.
3. Trailing commas are not allowed

Aside from these exceptions, if typescript compiles you should be good to go.

## FAQ

"Why typescript?"\
I chose typescript for this because of the well rounded interface and class typing infrastructure. The main purpose of this codebase is type checking, so typescript seemed a natural choice therefrom.

"My code doesn't work"\
Make sure that you followed the usage guide and are correctly invoking your subclass' compile function. If you think there is an issue with the codebase itself, feel free to report an issue. I would recommend making small changes to the sample code first before forging on your own.

"This is too complicated. How am I supposed to make sense of all the rules and requirements?"\
Much of the code's needless complexity is itself reliant upon Notion's API. Mitigating this would be incredibly difficult and something I do not currently have the time for.

"Can I buy you a coffee?"\
You sure can :)\
<a href="https://www.buymeacoffee.com/charliepalm" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## Contributing

Submit a pull request (with unit test coverage please) and I'll happily review it. Otherwise you're free to fork and use as you will.

## Known Bugs

Currently there are no known bugs, but please feel free to report any issues that you might find.

## Future Plans

If at all possible, I would like to expand the usage of variable definition, helper function invocation, and other such tools that Notion doesn't support. 
Doing so is going beyond a translator and quickly becoming a compiler but that's the one thing that I feel could really expand this project, though currently I have no plans or ideas on how to efficiently implement this.

## License
[MIT License](https://opensource.org/licenses/MIT) 
