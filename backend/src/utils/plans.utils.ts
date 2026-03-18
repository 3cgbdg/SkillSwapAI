export class PlansUtils {
  static planInclude() {
    return {
      include: {
        modules: {
          include: {
            resources: true,
          },
        },
      },
    };
  }
}
