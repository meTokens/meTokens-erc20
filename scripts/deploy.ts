import { deploy } from "../test/utils/helpers";
import { MeTokens } from "../artifacts/types";

async function main() {
  // deploy erc20 contract
  let meTokens = await deploy<MeTokens>(
    "MeTokens",
    undefined,
    "meTokens",
    "ME"
  );
  console.log(meTokens.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
